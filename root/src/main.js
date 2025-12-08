// ===========================================
// src/main.js
// ===========================================
import { FormRenderer } from './components/FormRenderer.js'; // 모듈 import
import { TemplateGenerator } from './services/TemplateGenerator.js'; // 모듈 import
import { Downloader } from './services/Downloader.js';
import { StorageManager } from './services/StorageManager.js';
import { Sidebar } from './components/Sidebar.js';
// ===========================================
const DOCKERFILE_PREVIEW_ID = 'dockerfile-code';
const STEP_CONTAINER_ID = 'step-container';
const NEXT_BUTTON_ID = 'next-step';
const PREV_BUTTON_ID = 'prev-step';

// 하이라이트.js 테마 URL 및 링크 ID
const HLJS_THEME_DARK = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
const HLJS_THEME_LIGHT = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css';
const HLJS_THEME_LINK_ID = 'hljs-theme-link';

// 앱의 상태를 저장할 객체
const state = {
    currentStep: 1,
    maxSteps: 4, 
    configData: {
        step1: {
            baseImage: 'alpine:latest',
            language: 'none',
            projectName: 'my-docker-app',
        },
        step2: {
            port: '8080',
            runCommands: '',
        },
        step3: {
            target: 'all',
        },
        step4: {}
    } // 모든 설정 데이터가 저장될 곳
};

// 모듈 인스턴스 변수
let formRenderer; 
let finalDockerfileContent = '';
let finalMakefileContent = '';
let storageManager = new StorageManager();
let sidebar;
let currentProjectId = 'default_starter_project'; // 기본 프로젝트 ID

// ===========================================
// 초기화 함수 및 이벤트 리스너 설정
// ===========================================
/**
 * 현재 configData를 기반으로 코드를 생성하고 프리뷰 영역을 업데이트합니다.
 */
function updateCodePreview(configData) {
    const safeConfig = configData || {};
    const generator = new TemplateGenerator();

    let dockerfileContent = '';
    let makefileContent = ''; // 💡 Makefile 변수 추가

    // Step 1과 2가 완료되었을 때 Dockerfile 생성 가능
    if (safeConfig.step1 && safeConfig.step2) { 
        dockerfileContent = generator.generateDockerfile(safeConfig);
    }
    
    // Step 3이 완료되었을 때 Makefile 생성 가능 (Step 1, 2가 필수)
    if (safeConfig.step1 && safeConfig.step2 && safeConfig.step3) {
        makefileContent = generator.generateMakefile(safeConfig);
    }

    finalDockerfileContent = dockerfileContent;
    finalMakefileContent = makefileContent;
    
    storageManager.saveProject(currentProjectId, state.configData); // 상태 저장
    
    const newProjectName = configData.step1.projectName;
    if (newProjectName) {
        let projectList = storageManager.loadProjectList();
        const projectIndex = projectList.findIndex(p => p.id === currentProjectId);
        
        if (projectIndex !== -1 && projectList[projectIndex].name !== newProjectName) {
            projectList[projectIndex].name = newProjectName;
            projectList[projectIndex].timestamp = Date.now(); // 최근 사용으로 업데이트
            storageManager.saveProjectList(projectList);
            sidebar.render(currentProjectId); // 사이드바 렌더링하여 이름 변경 반영
        }
    }
    
    // Dockerfile 프리뷰 업데이트 (이전 로직 유지)
    const dockerfileElement = document.getElementById('dockerfile-preview');
    if (dockerfileElement) {
        dockerfileElement.textContent = dockerfileContent || 'Dockerfile 코드가 여기에 표시됩니다.';
    
        delete dockerfileElement.dataset.highlighted;
    }

    // 💡 Makefile 프리뷰 업데이트
    const makefileElement = document.getElementById('makefile-preview');
    if (makefileElement) {
        makefileElement.textContent = makefileContent || 'Makefile 코드가 여기에 표시됩니다.';
    
        delete makefileElement.dataset.highlighted;
    }

    // 코드 하이라이팅 적용
    if (window.hljs) {
        // 💡 수정: highlightAll() 대신 개별 요소를 대상으로 명시적 호출
        if (dockerfileElement) {
            hljs.highlightElement(dockerfileElement); // 이 요소만 정확히 재하이라이팅
        }
        if (makefileElement) {
            hljs.highlightElement(makefileElement); // 이 요소만 정확히 재하이라이팅
        }
    }
}

/**
 * Step 4에서 다운로드 버튼 클릭을 처리합니다.
 * @param {string} type - 다운로드할 파일 종류 ('dockerfile' 또는 'makefile')
 */
function handleDownload(type) {
    const downloader = new Downloader();
    
    if (type === 'dockerfile' && finalDockerfileContent) {
        downloader.saveFile('Dockerfile', finalDockerfileContent);
    } else if (type === 'makefile' && finalMakefileContent) {
        downloader.saveFile('Makefile', finalMakefileContent);
    } else {
        alert('아직 코드가 생성되지 않았거나 비어 있습니다. 이전 단계를 확인해 주세요.');
    }
}

function setNextButtonDisabledState(isValid) {
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    if (state.currentStep < state.maxSteps) {
        nextButton.disabled = !isValid; //유효하지 않으면 disables를 true로 설정
    } else {
        nextButton.disabled = true; //마지막 단계에서는 항상 비활성화
    }
}

function initializeApp() {
    console.log("앱 초기화 시작 - Vanilla JS Modules");
    loadTheme();
    storageManager = new StorageManager(); 

    // 💡 1. FormRenderer를 먼저 초기화해야 합니다.
    //    loadProjectIntoApp 또는 startNewProject 내에서 formRenderer.render()를 호출하기 때문입니다.
    formRenderer = new FormRenderer(
        STEP_CONTAINER_ID, 
        state.configData, // 초기 configData 전달 (나중에 로드된 데이터로 덮어씌워짐)
        updateCodePreview,
        setNextButtonDisabledState
    ); 

    // 💡 2. Sidebar 인스턴스 생성 (FormRenderer 생성 후)
    sidebar = new Sidebar({
        onProjectSelected: loadProjectIntoApp,
        onNewProject: startNewProject,
    });
    
    // 💡 3. 초기 프로젝트 로드 로직 실행
    const projectList = storageManager.loadProjectList();
    
    if (projectList.length > 0) {
        const latestProject = projectList.sort((a, b) => b.timestamp - a.timestamp)[0];
        // loadProjectIntoApp 내부에서 renderCurrentStep() 호출
        loadProjectIntoApp(latestProject.id); 
        console.log("최근 프로젝트 불러오기 완료:", latestProject.name);
    } else {
        // 프로젝트가 없으면 기본 프로젝트 생성
        createDefaultProject();
    }
    
    // 💡 4. 이벤트 리스너 설정
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);

    const themeToggleButton = document.getElementById('theme-toggle-btn');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleDarkMode);
    }

    nextButton.addEventListener('click', handleNextStep);
    prevButton.addEventListener('click', handlePrevStep);

}

function renderCurrentStep() {
    // FormRenderer 모듈을 통해 현재 단계의 폼 렌더링 요청
    state.configData.currentStep = state.currentStep; // 현재 단계를 configData에 반영
    formRenderer.render(state.currentStep); 
    
    // 버튼 상태 업데이트 로직 (기존과 동일)
    const nextButton = document.getElementById(NEXT_BUTTON_ID);
    const prevButton = document.getElementById(PREV_BUTTON_ID);
    prevButton.disabled = state.currentStep === 1;

    // '다음' 버튼 상태는 현재 단계의 유효성 검사 결과에 따라 결정
    if (state.currentStep < state.maxSteps) {
        formRenderer.validateAndShowFeedback(state.configData[`step${state.currentStep}`], state.currentStep);
    } else {
        setNextButtonDisabledState(false); // 마지막 단계에서는 비활성화
    }

    if (state.currentStep === state.maxSteps) { // state.maxSteps = 4
        const downloadDockerfileBtn = document.getElementById('download-dockerfile');
        const downloadMakefileBtn = document.getElementById('download-makefile');

        if (downloadDockerfileBtn) {
            downloadDockerfileBtn.addEventListener('click', () => handleDownload('dockerfile'));
        }
        if (downloadMakefileBtn) {
            downloadMakefileBtn.addEventListener('click', () => handleDownload('makefile'));
        }
        
        // Step 4에서는 '다음' 버튼은 항상 비활성화 상태로 유지
        setNextButtonDisabledState(false); 
    }

    
}

function handleNextStep() {
    if (!formRenderer.validateForNextStep()) {
        return; // 유효성 검사 실패 시 다음 단계로 진행하지 않음
    }
    if (state.currentStep < state.maxSteps) {
        state.currentStep++;
        renderCurrentStep();
    }
}

function handlePrevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        renderCurrentStep();
    }
}

/**
 * 다크/라이트 모드를 토글하고 상태를 localStorage에 저장합니다.
 */
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const themeLink = document.getElementById(HLJS_THEME_LINK_ID);
    
    // 💡 Highlight.js 테마 CSS 파일 경로 전환
    if (themeLink) {
        if (isDarkMode) {
            // 다크 모드가 활성화되면, 다크 테마 CSS 로드
            themeLink.href = HLJS_THEME_DARK;
        } else {
            // 라이트 모드가 활성화되면, 라이트 테마 CSS 로드
            themeLink.href = HLJS_THEME_LIGHT;
        }
    }

    // localStorage를 사용하여 상태 저장
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

/**
 * 로컬 스토리지에 저장된 테마를 로드하여 적용합니다.
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeLink = document.getElementById(HLJS_THEME_LINK_ID);
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        // 💡 초기 로드 시 다크 테마 적용
        if (themeLink) themeLink.href = HLJS_THEME_DARK; 
    } else {
        // 💡 초기 로드 시 라이트 테마 적용
        if (themeLink) themeLink.href = HLJS_THEME_LIGHT;
    }
}
/**
 * @description 특정 프로젝트 ID의 데이터를 불러와 앱 상태를 업데이트하고 UI를 리렌더링합니다.
 * @param {string} projectId - 로드할 프로젝트의 고유 ID
 */
function loadProjectIntoApp(projectId) {
    if (currentProjectId === projectId) return;

    const loadedConfig = storageManager.loadProject(projectId);

    if (loadedConfig) {
        currentProjectId = projectId;
        state.configData = loadedConfig;
        state.currentStep = 1;
        state.configData.currentStep = 1;

        formRenderer.config = state.configData;
        console.log(`프로젝트 로드 완료: ${projectId}`);
        
        sidebar.render(currentProjectId);
        renderCurrentStep();
        updateCodePreview(state.configData);
    } else {
        console.error(`프로젝트 ID ${projectId}를 찾을 수 없습니다.`);
        startNewProject();
    }
}

/**
 * @description 새로운 프로젝트를 시작하고 기본 상태로 앱을 초기화합니다.
 */
/**
 * @description 기본 프로젝트를 자동으로 생성합니다 (초기 로드 시)
 */
function createDefaultProject() {
    const newProjectId = `proj_${Date.now()}`;
    const newProjectName = "My First Docker App";

    // 1. 새로운 상태 데이터 생성 (기본값)
    state.configData = {
        step1: { 
            language: 'node', 
            version: '18', 
            port: '3000', 
            projectName: newProjectName.toLowerCase() 
        },
        step2: { 
            workDir: '/app',
            installCommandOverride: '',
            copyPath: '.',
            runUser: ''
        },
        step3: { 
            buildArgs: '',
            runPortMap: '8080:3000',
            runVolume: ''
        },
        step4: {},
        currentStep: 1
    };

    // 2. 프로젝트 목록에 추가
    const projectList = storageManager.loadProjectList();
    projectList.push({ 
        id: newProjectId, 
        name: newProjectName, 
        timestamp: Date.now() 
    });
    storageManager.saveProjectList(projectList);
    
    // 3. 프로젝트 데이터 저장
    storageManager.saveProject(newProjectId, state.configData);

    // 4. 앱 상태 업데이트
    currentProjectId = newProjectId;
    state.currentStep = 1;
    
    formRenderer.config = state.configData;
    sidebar.render(currentProjectId);
    renderCurrentStep();
    updateCodePreview(state.configData);
}

function startNewProject(defaultName) {
    const newProjectId = `proj_${Date.now()}`;
    // defaultName 인수를 받도록 수정하는 것이 좋습니다.
    const newProjectName = prompt("새 프로젝트 이름을 입력하세요:", defaultName || `New Project ${new Date().toLocaleTimeString()}`);
    
    if (!newProjectName) {
        return;
    }

    // 1. 새로운 상태 데이터 생성 (기본값)
    state.configData = {
        step1: { 
            language: 'node', 
            version: '18', 
            port: '3000', 
            projectName: newProjectName.toLowerCase() 
        },
        step2: { 
            workDir: '/app',
            installCommandOverride: '',
            copyPath: '.',
            runUser: ''
        },
        step3: { 
            buildArgs: '',
            runPortMap: '8080:3000',
            runVolume: ''
        },
        step4: {},
        currentStep: 1
    };

    // 2. 프로젝트 목록에 추가
    const projectList = storageManager.loadProjectList();
    projectList.push({ 
        id: newProjectId, 
        name: newProjectName, 
        timestamp: Date.now() 
    });
    storageManager.saveProjectList(projectList);
    
    // 3. 프로젝트 데이터 저장
    storageManager.saveProject(newProjectId, state.configData);

    // 4. 앱 상태 업데이트 및 리렌더링
    currentProjectId = newProjectId;
    state.currentStep = 1;
    
    formRenderer.config = state.configData;
    sidebar.render(currentProjectId);
    renderCurrentStep();
    updateCodePreview(state.configData);
}

// 앱 시작
initializeApp();