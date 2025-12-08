// ===========================================
// src/services/StorageManager.js (수정)
// ===========================================

export class StorageManager {
    
    // 💡 프로젝트 목록의 키 상수
    static PROJECT_LIST_KEY = 'docker_configs_list';
    
    constructor() {
        // 이전에 사용했던 단일 저장 키는 이제 사용하지 않거나, 호환성을 위해 유지합니다.
        // 여기서는 프로젝트 목록 관리 기능에 집중합니다.
    }

    /**
     * @description 프로젝트 목록(ID와 이름)을 localStorage에 저장합니다.
     * @param {Array<Object>} projectList - [{ id: string, name: string, timestamp: number }]
     */
    saveProjectList(projectList) {
        try {
            const data = JSON.stringify(projectList);
            localStorage.setItem(StorageManager.PROJECT_LIST_KEY, data);
        } catch (error) {
            console.error("Error saving project list to localStorage:", error);
        }
    }

    /**
     * @description 저장된 프로젝트 목록을 불러옵니다. 없으면 빈 배열을 반환합니다.
     * @returns {Array<Object>}
     */
    loadProjectList() {
        try {
            const data = localStorage.getItem(StorageManager.PROJECT_LIST_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading project list from localStorage:", error);
            return [];
        }
    }

    /**
     * @description 단일 프로젝트의 상세 설정(configData)을 저장합니다.
     * @param {string} projectId - 프로젝트의 고유 ID
     * @param {Object} configData - state.configData 객체
     */
    saveProject(projectId, configData) {
        if (!projectId) return;
        try {
            const data = JSON.stringify(configData);
            // 프로젝트 ID를 키로 사용
            localStorage.setItem(projectId, data); 
        } catch (error) {
            console.error(`Error saving project ${projectId}:`, error);
        }
    }

    /**
     * @description 특정 프로젝트의 상세 설정을 불러옵니다.
     * @param {string} projectId - 프로젝트의 고유 ID
     * @returns {Object|null} - 설정 데이터 또는 null
     */
    loadProject(projectId) {
        if (!projectId) return null;
        try {
            const data = localStorage.getItem(projectId);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading project ${projectId}:`, error);
            return null;
        }
    }

    /**
     * @description 특정 프로젝트와 해당 프로젝트 ID를 목록에서 모두 삭제합니다.
     * @param {string} projectId - 프로젝트의 고유 ID
     */
    deleteProject(projectId) {
        if (!projectId) return;

        try {
            // 1. 프로젝트 상세 데이터 삭제
            localStorage.removeItem(projectId);

            // 2. 프로젝트 목록에서 ID 제거 후 목록 업데이트
            let projectList = this.loadProjectList();
            projectList = projectList.filter(p => p.id !== projectId);
            this.saveProjectList(projectList);
            
            console.log(`Project ${projectId} deleted successfully.`);

        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
        }
    }
    
    // 💡 참고: 기존 loadState/saveState는 단일 프로젝트 저장 방식이었으므로,
    // 이 클래스 내에서 더 이상 사용하지 않거나, 새 메소드로 대체합니다.
    // 기존의 loadState/saveState 호출을 모두 saveProject/loadProject로 대체해야 합니다.
}