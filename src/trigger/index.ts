import { TriggerClient } from "@trigger.dev/sdk";

// 클라이언트 ID는 프로젝트에 맞게 자유롭게 설정할 수 있습니다.
// apiKey는 반드시 환경 변수를 통해 제공해야 합니다.
export const client = new TriggerClient({
    id: "aiconsulting-triggers", // 예시 ID
    apiKey: process.env.TRIGGER_API_KEY,
    apiUrl: process.env.TRIGGER_API_URL, // 자체 호스팅 또는 특정 엔드포인트 사용 시
});

// ./jobs 디렉토리의 모든 작업을 자동으로 가져와 등록합니다.
// 개별적으로 import 할 수도 있습니다: import "./jobs/newsletter";
import "./jobs"; // jobs 디렉토리 내의 모든 .ts 또는 .js 파일을 작업으로 간주

// `trigger.dev dev` 명령 실행 시 이 파일이 사용됩니다.
// 환경 변수 TRIGGER_API_KEY 와 SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.
// 또한, Resend API 키는 newsletter.ts 파일 내에 하드코딩 되어 있습니다.