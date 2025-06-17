import { SupabaseClient, createClient, User as SupabaseAuthUser, AuthError, PostgrestError } from "@supabase/supabase-js";
import { schedules, task, logger } from "@trigger.dev/sdk/v3";
import { Resend } from "resend"; // 'resend' 패키지가 설치되어 있어야 합니다.

// Resend API 키
const resendApiKey = "re_cGLo65zs_8PjjNqb5EXZtf4cDB3iujDe9"; // 사용자 제공 API 키
const resend = new Resend(resendApiKey);

// Supabase 프로젝트 정보
const supabaseUrl = "https://bhslmejrghpccbigvoos.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
    logger.error(
        "SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다. 뉴스레터 발송 작업이 정상적으로 동작하지 않을 수 있습니다."
    );
    // 프로덕션 환경에서는 여기서 오류를 발생시키거나 작업을 중단해야 합니다.
}

// Supabase 클라이언트 초기화 (서비스 역할 키 사용)
const supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey || "YOUR_FALLBACK_SERVICE_ROLE_KEY_FOR_LOCAL_DEV_ONLY" // 실제 키로 대체하고 커밋하지 마세요.
);

interface Tool {
    id: string;
    name: string;
    description_korean: string | null;
    url: string;
}

// Supabase auth.admin.listUsers()가 반환하는 사용자 객체의 타입 일부
interface CustomUser extends SupabaseAuthUser {
    deleted_at?: string | undefined; // 탈퇴한 사용자 필터링용
}

export const sendNewsletter = schedules.task({
    id: "send-daily-newsletter",
    cron: "0 9 * * *", // 매일 오전 9시 (UTC 기준)
    // timezone: "Asia/Seoul", // 한국 시간 오전 9시로 변경 시: "0 0 * * *" (UTC 0시) 또는 timezone 명시
    run: async (payload: any) => {
        logger.info("뉴스레터 발송 작업을 시작합니다.", payload);

        if (!supabaseServiceRoleKey) {
            logger.error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않아 작업을 중단합니다.");
            return { error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다." };
        }

        try {
            // 1. 모든 활성 사용자 정보 가져오기 (Supabase Admin API 사용)
            const {
                data: { users },
                error: usersError,
            } = await supabase.auth.admin.listUsers({
                // 모든 사용자를 가져오려면 페이지네이션 처리 필요
                // perPage: 1000, // 예시: 한 번에 최대 1000명
            });

            if (usersError) {
                // AuthError 타입으로 캐스팅하여 상세 정보 로깅
                const errorDetails = usersError as AuthError;
                logger.error("Supabase에서 사용자 정보를 가져오는데 실패했습니다:", {
                    message: errorDetails.message,
                    name: errorDetails.name,
                    status: errorDetails.status,
                });
                throw usersError;
            }

            if (!users || users.length === 0) {
                logger.info("뉴스레터를 발송할 사용자가 없습니다.");
                return { message: "뉴스레터를 발송할 사용자가 없습니다." };
            }

            // 이메일이 있고, 탈퇴하지 않은 사용자만 필터링
            const activeUsersWithEmail = users.filter(
                (user: CustomUser) => user.email && !user.deleted_at
            );

            if (activeUsersWithEmail.length === 0) {
                logger.info("뉴스레터를 발송할 유효한 사용자가 없습니다.");
                return { message: "뉴스레터를 발송할 유효한 사용자가 없습니다." };
            }

            logger.info(
                `${activeUsersWithEmail.length}명의 사용자에게 뉴스레터를 발송합니다.`
            );

            // 2. 랜덤 툴 5개 선택 (Supabase RPC 함수 호출)
            const { data: randomTools, error: toolsError } = await supabase.rpc(
                "get_random_tools", // 이 함수는 미리 Supabase에 생성되어 있어야 합니다.
                { limit_count: 5 }
            );

            if (toolsError) {
                // PostgrestError 타입으로 캐스팅하여 상세 정보 로깅
                const errorDetails = toolsError as PostgrestError;
                logger.error("Supabase에서 랜덤 툴을 가져오는데 실패했습니다:", {
                    message: errorDetails.message,
                    code: errorDetails.code,
                    details: errorDetails.details,
                    hint: errorDetails.hint,
                });
                if (errorDetails.message.includes("does not exist")) {
                    logger.error("get_random_tools RPC 함수가 데이터베이스에 존재하지 않는 것 같습니다. SQL 함수를 생성해주세요.");
                }
                throw toolsError;
            }

            if (!randomTools || randomTools.length === 0) {
                logger.info("추천할 툴이 없습니다.");
                return { message: "추천할 툴이 없습니다." };
            }

            logger.info("선택된 툴:", randomTools);

            // 3. 뉴스레터 내용 생성 및 발송
            const subject = "오늘의 AI 추천 툴을 확인하세요! 🚀";
            const toolsArray = randomTools as Tool[];

            // 툴 목록 HTML 생성
            let toolListHtml = "";
            for (const tool of toolsArray) {
                toolListHtml += `
                <div>
                  <h3><a href="${tool.url}" target="_blank">${tool.name}</a></h3>
                  <p>${tool.description_korean || "한글 설명이 없습니다."}</p>
                </div>
                <hr />`;
            }

            // 마지막 <hr /> 태그 제거
            if (toolListHtml.endsWith("<hr />")) {
                toolListHtml = toolListHtml.slice(0, -6);
            }

            for (const user of activeUsersWithEmail) {
                if (!user.email) {
                    logger.warn(`사용자 ID ${user.id}의 이메일 주소가 없습니다. 스킵합니다.`);
                    continue;
                }

                const htmlBody = `
                <h1>오늘의 추천 AI 툴 5가지!</h1>
                <p>안녕하세요, ${user.email || "사용자님"}! 매일 새로운 AI 툴을 발견하고 업무 효율을 높여보세요.</p>
                ${toolListHtml}
                <br/>
                <p>AI 컨설팅 팀 드림</p>
                `;

                try {
                    await resend.emails.send({
                        from: "AI 컨설팅 <newsletter@submail.idea2posts.com>", // 중요: Resend에 등록된 발신자 도메인으로 변경
                        to: user.email,
                        subject: subject,
                        html: htmlBody,
                    });
                    logger.info(`${user.email}에게 뉴스레터를 성공적으로 발송했습니다.`);
                } catch (emailError: any) { // emailError 타입을 any로 임시 지정
                    logger.error(
                        `${user.email}에게 뉴스레터 발송 중 오류 발생:`,
                        { message: (emailError as Error).message, name: (emailError as Error).name }
                    );
                }
            }

            return { message: "뉴스레터 발송 작업이 완료되었습니다." };
        } catch (error: any) { // error 타입을 any로 임시 지정
            logger.error("뉴스레터 발송 작업 중 심각한 오류 발생:", { message: (error as Error).message, name: (error as Error).name });
            return { error: "뉴스레터 발송 작업 중 심각한 오류가 발생했습니다." };
        }
    },
});

// 로컬 개발 시 SUPABASE_SERVICE_ROLE_KEY, TRIGGER_API_KEY 환경 변수 설정 및
// 'resend' 패키지 설치를 확인하세요. (npm install resend 또는 yarn add resend)
// Supabase에 get_random_tools SQL 함수가 생성되어 있어야 합니다. 