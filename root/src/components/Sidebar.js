// ===========================================
// src/ui/Sidebar.js
// ===========================================

import { StorageManager } from '../services/StorageManager.js';

/**
 * @description 사이드바 UI를 관리하고 프로젝트 목록을 렌더링하는 클래스입니다.
 */
export class Sidebar {
    /**
     * @param {Object} callbacks - 메인 앱 로직과 연결하기 위한 콜백 함수 객체
     * @param {function(string): void} callbacks.onProjectSelected - 프로젝트가 선택될 때 호출될 함수 (projectId 전달)
     * @param {function(): void} callbacks.onNewProject - 새 프로젝트 시작 버튼이 눌렸을 때 호출될 함수
     * @param {function(string): void} callbacks.onProjectDeleted - 프로젝트가 삭제될 때 호출될 함수 (projectId 전달)
     */
    constructor(callbacks) {
        this.storageManager = new StorageManager();
        this.projectListElement = document.getElementById('project-list');
        this.newProjectButton = document.getElementById('new-project-btn');
        this.callbacks = callbacks;
        this.activeProjectId = null;

        this._setupEventListeners();
    }

    /**
     * @description DOM 이벤트 리스너를 설정합니다.
     */
    _setupEventListeners() {
        // 프로젝트 목록 항목 클릭 이벤트
        this.projectListElement.addEventListener('click', (e) => {
            const listItem = e.target.closest('li[data-project-id]');
            if (listItem) {
                const projectId = listItem.dataset.projectId;
                if (projectId && projectId !== this.activeProjectId) {
                    this.callbacks.onProjectSelected(projectId);
                }
            }
        });

        // 새 프로젝트 시작 버튼 클릭 이벤트
        this.newProjectButton.addEventListener('click', () => {
            this.callbacks.onNewProject();
        });
    }

    /**
     * @description StorageManager에서 프로젝트 목록을 불러와 사이드바를 렌더링합니다.
     * @param {string | null} activeId - 현재 활성화된 프로젝트의 ID
     */
    render(activeId = null) {
        this.activeProjectId = activeId;
        const projectList = this.storageManager.loadProjectList();
        
        // 목록 비우기
        this.projectListElement.innerHTML = ''; 

        if (projectList.length === 0) {
            // 프로젝트가 없을 때 빈 상태 표시
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.textContent = '프로젝트가 없습니다.';
            this.projectListElement.appendChild(emptyItem);
            return;
        }

        // 프로젝트를 최신순으로 정렬 (timestamp 기준)
        projectList.sort((a, b) => b.timestamp - a.timestamp);

        projectList.forEach(project => {
            const listItem = document.createElement('li');
            listItem.dataset.projectId = project.id;
            listItem.textContent = project.name;

            // 현재 활성화된 프로젝트에 'active' 클래스 추가
            if (project.id === activeId) {
                listItem.classList.add('active');
            }

            this.projectListElement.appendChild(listItem);
        });
    }

    /**
     * @description Sidebar를 초기화하고 현재 활성 프로젝트를 표시합니다.
     * @param {string | null} initialActiveId - 초기 활성 프로젝트 ID
     */
    initialize(initialActiveId = null) {
        this.render(initialActiveId);
    }
}