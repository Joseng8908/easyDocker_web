// src/components/Sidebar.js

export class Sidebar {
    constructor(sidebarElementId, onProjectLoad, onNewProject) {
        // sidebarElementId: 사이드바가 렌더링될 DOM ID (예: 'sidebar-container')
        // onProjectLoad: 프로젝트 로드 시 main.js로 전달할 콜백 함수
        // onNewProject: 새 프로젝트 버튼 클릭 시 호출될 콜백 함수
    }

    // 💡 사이드바에 표시될 프로젝트 목록(ID, 이름)을 받아 UI를 렌더링합니다.
    render(projectList) {
        // ... (DOM 조작: 목록, 저장 버튼, 새 프로젝트 버튼 생성)
    }

    // 💡 현재 활성화된 프로젝트를 시각적으로 강조 표시합니다.
    setActiveProject(projectId) {
        // ... (CSS 클래스 조작)
    }

    // 💡 모든 이벤트 리스너를 설정합니다.
    attachEventListeners() {
        // ... (프로젝트 목록 클릭, 새 프로젝트 버튼 클릭 이벤트 설정)
    }
}