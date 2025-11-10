// ===========================================
// src/components/FormRenderer.js
// ===========================================
import { validateStep1, validateStep2 } from '../utils/validator.js';

export class FormRenderer {
    constructor(stepContainerId, configData, updateCallback, setNextButtonStateCallback) {
        // 폼이 렌더링될 HTML 요소 ID
        this.container = document.getElementById(stepContainerId);
        // 앱의 전체 설정 상태 (main.js에서 공유)
        this.config = configData;
        this.updateCallback = updateCallback; // 프리뷰 업데이트 콜백 함수
        this.setNextButtonStateCallback = setNextButtonStateCallback;

        // Step 1 데이터의 기본값 설정 (초기화)
        if (!this.config.step1) {
            this.config.step1 = {
                language: 'node',
                version: '18',
                port: '3000',
                projectName: 'my-app'
            };
        }
        // ✅ 수정: Step 2 데이터 기본값 설정 (초기화)
        if (!this.config.step2) {
            this.config.step2 = {
                workDir: '/app', 
                installCommandOverride: '', 
                copyPath: '.',
                runUser: '',
            };
        }
    }

    /**
     * 현재 단계에 맞는 폼을 렌더링합니다.
     * @param {number} step - 현재 단계 번호 (1, 2, 3...)
     */
    render(step) {
        this.container.innerHTML = ''; // 기존 내용 초기화
        
        if (step === 1) { this.renderStep1();} 
        else if (step === 2) { this.renderStep2(); }
        // else if (step === 3) { this.renderStep3(); } // 추후 확장
        // else if (step === 4) { this.renderStep4(); } // 추후 확장
    }

    // ===========================================
    // Step 1: 프로젝트 기본 정보 폼
    // ===========================================
    renderStep1() {
        //디버그용 콘솔 출력
        console.log("Rendering Step 1 Form");
        const html = `
            <h3>Step 1. 프로젝트 기본 정보</h3>
            <div class="form-group">
                <label for="projectName">📦 프로젝트 이름 (컨테이너/이미지 이름):</label>
                <input type="text" id="projectName" name="projectName" required 
                       value="${this.config.step1.projectName}" 
                       placeholder="예: my-backend-api">
                <small class="error-message" id="error-projectName"></small>
            </div>

            <div class="form-group">
                <label for="language">💻 주 언어 및 환경 선택:</label>
                <select id="language" name="language">
                    <option value="node" ${this.config.step1.language === 'node' ? 'selected' : ''}>Node.js</option>
                    <option value="python" ${this.config.step1.language === 'python' ? 'selected' : ''}>Python</option>
                    <option value="java" ${this.config.step1.language === 'java' ? 'selected' : ''}>Java (OpenJDK)</option>
                </select>
            </div>

            <div class="form-group">
                <label for="version">🔢 버전 (예시):</label>
                <input type="text" id="version" name="version" required 
                       value="${this.config.step1.version}" 
                       placeholder="예: 18 (Node), 3.10 (Python), 17 (Java)">
                <small class="error-message" id="error-version"></small>
            </div>

            <div class="form-group">
                <label for="port">🌐 노출 포트 (컨테이너 내부 포트):</label>
                <input type="number" id="port" name="port" required 
                       value="${this.config.step1.port}" 
                       placeholder="예: 3000 (Node), 8000 (Python), 8080 (Java)">
                <small class="error-message" id="error-port"></small>
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners(1); // 이벤트 리스너 부착
    }
    
    // ===========================================
    // Step 2: Dockerfile 세부 설정 폼 (💡 새로 추가)
    // ===========================================
    renderStep2() {
        //디버그용 콘솔 출력
        console.log("Rendering Step 2 Form");
        const html = `
            <h3>Step 2. Dockerfile 세부 설정</h3>
            <div class="form-group">
                <label for="workDir">📁 작업 디렉토리 (WORKDIR):</label>
                <input type="text" id="workDir" name="workDir" 
                       value="${this.config.step2.workDir || ''}" placeholder="/app">
                <small class="error-message" id="error-workDir"></small>
            </div>
            
            <div class="form-group">
                <label for="copyPath">📄 프로젝트 복사 경로 (COPY . [경로]):</label>
                <input type="text" id="copyPath" name="copyPath" 
                       value="${this.config.step2.copyPath || ''}" placeholder=".">
                <small class="error-message" id="error-copyPath"></small>
            </div>

            <div class="form-group">
                <label for="installCommandOverride">⚙️ 설치 명령어 오버라이드 (RUN):</label>
                <input type="text" id="installCommandOverride" name="installCommandOverride" 
                       value="${this.config.step2.installCommandOverride || ''}" 
                       placeholder="예: npm install --production">
                <small class="error-message" id="error-installCommandOverride"></small>
            </div>

            <div class="form-group">
                <label for="runUser">👤 사용자 설정 (USER):</label>
                <input type="text" id="runUser" name="runUser" 
                       value="${this.config.step2.runUser || ''}" 
                       placeholder="예: node (루트 권한 사용 방지)">
                <small class="error-message" id="error-runUser"></small>
            </div>
        `;
        
        this.container.innerHTML = html;
        // 💡 Step 2 렌더링 후 이벤트 리스너 부착 및 유효성 검사 호출
        this.attachEventListeners(2); 
    }
    /**
     * 폼 필드에 입력이 발생했을 때 설정 상태를 업데이트하는 리스너를 부착합니다.
     */
    // 💡 Step에 따라 이벤트 리스너를 다르게 처리할 수 있도록 인수를 추가했습니다.
    attachEventListeners(step = 1) {
        this.container.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('input', (e) => this.handleInputChange(e));
        });

        // 폼이 렌더링 된 후, 초기 버튼 상태를 설정하기 위해 유효성 검사 호출
        const dataKey = `step${step}`;
        // 💡 Step 2의 데이터를 안전하게 전달합니다.
        this.validateAndShowFeedback(this.config[dataKey] || {}, step);
    }

    /**
     * 입력 변경을 처리하고 설정 상태를 업데이트합니다.
     * (여기서 실시간 프리뷰 업데이트 로직이 호출될 예정)
     * @param {Event} e - 이벤트 객체
     */
    handleInputChange(e) {
        const { name, value, type, checked } = e.target;
        const currentStep = this.config.currentStep || 1;
        if (!this.config[`step${currentStep}`]) {
            this.config[`step${currentStep}`] = {};
        }
        // 체크박스인 경우 checked 값을 사용
        if (type === 'checkbox') {
            this.config[`step${currentStep}`][name] = checked;
        }
        else {
            this.config[`step${currentStep}`][name] = value;
        }

        // 실시간 프리뷰 업데이트 콜백 호출
        this.updateCallback(); 
        
        // 💡 현재 단계 번호를 validateAndShowFeedback에 전달합니다.
        this.validateAndShowFeedback(this.config[`step${currentStep}`], currentStep);
    }
    
    /**
     * 유효성 검사를 실행하고, 에러 메시지를 표시하며, 버튼 상태를 업데이트합니다.
     * @param {Object} data - 현재 단계의 설정 데이터
     * @param {number} step - 현재 단계 번호 (💡 필수 인수)
     */
    validateAndShowFeedback(data, step) {
        const currentData = data || {};
        let validationResult;

        if(step === 1) {
            validationResult = validateStep1(data);
        } else if(step === 2) {
            validationResult = validateStep2(data);
        } else {
            validationResult = { isValid: true, errors: {} }
        }

        const { isValid, errors } = validationResult;

        Object.keys(data).forEach(fieldName => {
            const errorElement = document.getElementById(`error-${fieldName}`);
            const inputElement = document.getElementById(fieldName);

            if (errorElement && inputElement) {
                if (errors[fieldName]) {
                    // 에러가 있을 경우 에러 메시지를 표시
                    errorElement.textContent = errors[fieldName];
                    errorElement.style.display = 'block';
                    inputElement.classList.add('is-invalid');
                    } else{
                        // 에러가 없을 경우 에러 메시지 제거
                        errorElement.textContent = '';
                        errorElement.style.display = 'none';
                        inputElement.classList.remove('is-invalid');
                    }
                }
            });
        // main.js의 콜백을 호출하여 '다음' 버튼 상태 업데이트
        this.setNextButtonStateCallback(isValid);
        return isValid;
    }

    /**
     * 현재 단계에서 다음으로 넘어갈 수 있는지 최종적으로 확인합니다.
     * main.js의 handleNextStep에서 호출됩니다.
     */
    validateForNextStep() {
        // 💡 this.config.currentStep을 사용하려면 main.js에서 currentStep을 설정해야 합니다.
        const currentStep = this.config.currentStep || 1; 

        if (currentStep === 1) {
            return this.validateAndShowFeedback(this.config.step1, 1);
        } else if (currentStep === 2) {
            return this.validateAndShowFeedback(this.config.step2, 2);
        } else {
            return true; // Step 3, 4 등은 기본적으로 통과
        }
    }

}