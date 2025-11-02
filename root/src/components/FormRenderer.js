// ===========================================
// src/components/FormRenderer.js
// ===========================================

export class FormRenderer {
    constructor(stepContainerId, configData, updateCallback) {
        // 폼이 렌더링될 HTML 요소 ID
        this.container = document.getElementById(stepContainerId);
        // 앱의 전체 설정 상태 (main.js에서 공유)
        this.config = configData;
        this.updateCallback = updateCallback; // 프리뷰 업데이트 콜백 함수
        
        // Step 1 데이터의 기본값 설정 (초기화)
        if (!this.config.step1) {
            this.config.step1 = {
                language: 'node',
                version: '18',
                port: '3000',
                projectName: 'my-app'
            };
        }
    }

    /**
     * 현재 단계에 맞는 폼을 렌더링합니다.
     * @param {number} step - 현재 단계 번호 (1, 2, 3...)
     */
    render(step) {
        this.container.innerHTML = ''; // 기존 내용 초기화
        
        if (step === 1) {
            this.renderStep1();
        } 
        // else if (step === 2) { this.renderStep2(); } // 추후 확장
        // else if (step === 3) { this.renderStep3(); } // 추후 확장
        // else if (step === 4) { this.renderStep4(); } // 추후 확장
    }

    // ===========================================
    // Step 1: 프로젝트 기본 정보 폼
    // ===========================================
    renderStep1() {
        // 모던 JS의 Template Literals (백틱)을 사용하여 HTML 문자열 생성
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
        this.attachEventListeners(); // 이벤트 리스너 부착
    }
    
    /**
     * 폼 필드에 입력이 발생했을 때 설정 상태를 업데이트하는 리스너를 부착합니다.
     */
    attachEventListeners() {
        this.container.querySelectorAll('input, select').forEach(element => {
            // 'input' 이벤트는 키 입력 시마다 발생하여 실시간 업데이트에 유용
            element.addEventListener('input', (e) => this.handleInputChange(e));
        });
    }

    /**
     * 입력 변경을 처리하고 설정 상태를 업데이트합니다.
     * (여기서 실시간 프리뷰 업데이트 로직이 호출될 예정)
     * @param {Event} e - 이벤트 객체
     */
    handleInputChange(e) {
        const { name, value } = e.target;
        this.config.step1[name] = value; 
        
        // **⭐ 핵심:** 설정이 업데이트될 때마다 프리뷰 업데이트 함수 호출
        this.updateCallback(); 
        
        // TODO: 유효성 검사 로직은 다음 단계에서 추가합니다.
    }
    
}