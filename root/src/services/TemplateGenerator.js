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

    /**
     * Step 1, 2, 3 데이터를 기반으로 Makefile 내용을 생성합니다.
     * @param {Object} configData - 전체 설정 데이터
     * @returns {string} 생성된 Makefile 내용
     */
    generateMakefile(configData) {
        const { step1, step2, step3 } = configData;
        const projectName = step1.projectName || 'my-docker-app';
        const appName = projectName.toLowerCase();
        const language = step1.language || 'none';
        const port = step1.port || '3000';
        
        // Step 3 옵션 처리
        const buildArgs = step3.buildArgs ? `${step3.buildArgs}` : ''; // 예: --no-cache
        const portMap = step3.runPortMap ? `-p ${step3.runPortMap}` : ''; // 예: -p 8080:8080
        const volumeMount = step3.runVolume ? `-v ${step3.runVolume}` : ''; // 예: -v $(shell pwd)/data:/app/data

        // 언어별 실행 파일/커맨드 결정
        let runCommand = '';
        if (language === 'node') {
            runCommand = 'node ./src/index.js'; // Node.js 예시
        } else if (language === 'python') {
            runCommand = 'python3 ./src/app.py'; // Python 예시
        }
        // TODO: 다른 언어에 대한 runCommand 추가

        // 템플릿 리터럴을 사용한 Makefile 내용 정의
        const makefileContent = `
# =========================================================================
# Makefile for ${appName} (${language} Project)
# Generated by Dockerfile Config Generator
# =========================================================================

.PHONY: all build run clean shell

# Docker 이미지 및 컨테이너 이름 정의
IMAGE_NAME := ${appName}-image
CONTAINER_NAME := ${appName}-container

# 빌드 및 실행 옵션
BUILD_ARGS := ${buildArgs}
RUN_OPTS := ${portMap} ${volumeMount} -d --rm --name \${CONTAINER_NAME}

# 기본 빌드 타겟: 도커 이미지 빌드
build:
	@echo "🏗️ Building Docker image: \${IMAGE_NAME}..."
	@docker build \${BUILD_ARGS} -t \${IMAGE_NAME} .

# 기본 실행 타겟: 컨테이너 실행
run: build
	@echo "▶️ Running Docker container: \${CONTAINER_NAME}..."
	@docker run \${RUN_OPTS} \${IMAGE_NAME} 
	@echo ""
	@echo "Container \${CONTAINER_NAME} is running."
	@echo "You can check logs with: docker logs \${CONTAINER_NAME}"

# 개발용 셸 접속 타겟
shell:
	@echo "🐚 Connecting to running container shell..."
	@docker exec -it \${CONTAINER_NAME} /bin/sh

# 로컬 개발/테스트용 (실행 커맨드를 직접 사용)
local-run:
	@echo "🚀 Running locally with command: ${runCommand}"
	${runCommand}

# 컨테이너 중지 및 삭제 (clean은 이미지 삭제를 포함하지 않음)
stop:
	@echo "🛑 Stopping and removing container: \${CONTAINER_NAME}..."
	@docker stop \${CONTAINER_NAME} || true
	@docker rm \${CONTAINER_NAME} || true

# 전체 정리: 컨테이너 중지 및 이미지 삭제
clean: stop
	@echo "🗑️ Deleting Docker image: \${IMAGE_NAME}..."
	@docker rmi \${IMAGE_NAME} || true

all: build run
`;
        return makefileContent.trim();
    }
}