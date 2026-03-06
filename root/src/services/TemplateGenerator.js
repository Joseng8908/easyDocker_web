// ===========================================
// src/services/TemplateGenerator.js
// ===========================================

export class TemplateGenerator {
    /**
     * 프로젝트 설정을 기반으로 Dockerfile 문자열을 생성합니다.
     * @param {Object} configData - 앱의 전체 설정 데이터 (state.configData)
     * @returns {string} - 생성된 Dockerfile 내용
     */
    generateDockerfile(configData) {
        const step1 = configData.step1 || {}; // Step 1 데이터 가져오기
        const step2 = configData.step2 || {}; // Step 2 데이터 가져오기 (추후 사용 가능)
        // const step3 = configData.step3 || {}; // Step 3 데이터 가져오기 (추후 사용 가능)

        const { language, version, port } = step1;
        const { workDir, installCommandOverride, runUser } = step2;
        
        let baseImage = '';
        let installCommand = '';
        let startCommand = '';

        // 1. 언어별 기본 이미지 및 명령어 설정
        switch (language) {
            case 'node':
                baseImage = `node:${version}-alpine`;
                installCommand = 'npm install';
                startCommand = 'npm start';
                break;
            case 'python':
                baseImage = `python:${version}-slim`;
                installCommand = 'pip install --no-cache-dir -r requirements.txt';
                startCommand = 'python app.py'; // 예시 시작 파일
                break;
            case 'java':
                baseImage = `openjdk:${version}-jdk-slim`;
                installCommand = 'mkdir -p build && mv target/*.jar build/';
                startCommand = `java -jar build/${step1.projectName || 'app'}.jar`; 
                break;
            default:
                baseImage = 'alpine:latest';
                // 명령어가 없는 경우를 대비
                installCommand = '# Define your install command here'; 
                startCommand = '# Define your start command here';
        }

        // step 2 값 적용
        const finalWorkDir = workDir || '/app';
        const finalInstallCommand = installCommandOverride || installCommand;
        const finalCopyPath = step2.copyPath || '.';
        // 2. 모던 JS의 Template Literals을 사용한 Dockerfile 생성
        // 백틱(`)을 사용하고 ${변수}로 데이터를 삽입합니다.
        const dockerfile = `
# ----------------------------------------------------
# Step 1: 베이스 이미지 설정
# 프로젝트 언어: ${language}
# ----------------------------------------------------
FROM ${baseImage}

# 작업 디렉토리 설정
WORKDIR ${finalWorkDir}

# ----------------------------------------------------
# Step 2: 코드 복사 및 의존성 설치
# ----------------------------------------------------
# 의존성 파일만 먼저 복사 (캐싱 최적화)
COPY package*.json ${finalCopyPath}  # Node.js의 경우
# 또는 Python의 경우: COPY requirements.txt ${finalCopyPath}

# 의존성 설치 명령
RUN ${finalInstallCommand}

# 전체 프로젝트 파일 복사
COPY . ${finalCopyPath}

# 💡 RUN USER 설정 (Step 2 반영, 값이 있을 경우에만 추가)
${runUser ? `USER ${runUser}` : '# USER 명령어를 추가하여 권한을 낮출 수 있습니다.'}

# ----------------------------------------------------
# Step 3: 포트 및 실행 명령어 설정
# ----------------------------------------------------
# 노출할 포트 설정
EXPOSE ${port}

# 컨테이너 실행 명령어
CMD ["sh", "-c", "${startCommand}"]

# ----------------------------------------------------
# 생성일자: ${new Date().toISOString().split('T')[0]}
# ----------------------------------------------------
`;

        return dockerfile.trim(); // 시작과 끝의 불필요한 공백 제거
    }

}