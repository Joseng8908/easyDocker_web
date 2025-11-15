/**
 * 프로젝트 설정 데이터에 대한 유효성 검사를 수행합니다.
 * @param {Object} configData - state.configData의 step1 객체 {projectName, version, port, language}
 * @returns {Object} - { isValid: boolean, errors: { [key]: string } }
 */

export function validateStep1(step1Data) {
    const errors = {};
    let isValid = true;
    // 1. 프로젝트 이름 유효성 겁사
    if(!step1Data.projectName || step1Data.projectName === '') {
        errors.projectName = '프로그램 이름을 입력해주세요.';
        isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(step1Data.projectName)){
        // 소문자, 숫자, 하이픈만 허용되는 검사
        errors.projectName = '프로젝트 이름은 소문자, 숫자, 하이픈만 사용이 가능합니다.';
        isValid = false;
    }
    // 2. 언어 검사
    if (!step1Data.language || step1Data.language.trim() === ''){
        errors.language = '주 언어를 선택해주세요.';
        isValid = false;
    }
    // 3. 버전 검사
    if (!step1Data.version || step1Data.version.trim() === ''){
        errors.version = '버전을 입력해주세요';
        isValid = false;
    }
    // 4. 포트 검사
    const portNum = Number(step1Data.port);
    if (!step1Data.port || step1Data.port.trim() === ''){
        errors.port = '포트 번호를 입력해주세요.';
        isValid = false;
    } else if (isNaN(portNum) || portNum < 1 || portNum > 65535 || !Number.isInteger(portNum)){
        errors.port = '유효한 포트 번호(1 ~ 65535)를 입력해주세요.';
        isValid = false;
    }



    return {isValid, errors};
}

/**
 * Step 2의 세부 정보에 대한 유효성 검사를 수행합니다.
 * (현재는 필수 필드가 없으므로 항상 유효함을 반환)
 * @param {Object} step2Data - state.configData의 step2 객체
 * @returns {{isValid: boolean, errors: { [key: string]: string }}} 
 */

export function validateStep2(step2Data) {
    const errors = {};
    let isValid = true;
    
    // 현재 Step 2에는 필수 필드가 없으므로 항상 유효함을 반환
    return { isValid, errors };
}

/**
 * Step 3의 세부 정보에 대한 유효성 검사를 수행합니다.
 * (현재는 필수 필드가 없으므로 항상 유효함을 반환)
 * @param {Object} step3Data - state.configData의 step3 객체
 * @returns {{isValid: boolean, errors: { [key: string]: string }}}
 * 
 */
export function validateStep3(step3Data) {
    const errors = {};
    const isValid = true;
    
    // 포트 매핑 (runPortMap)에 대한 간단한 형식을 추가 검사할 수 있습니다.
    // 예: '8080:3000' 형태인지 확인하는 로직 등
    
    return { isValid, errors };
}