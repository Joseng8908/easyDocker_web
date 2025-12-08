// ===========================================
// src/services/StorageManager.js
// ===========================================

/**
 * 브라우저의 localStorage를 사용하여 여러 프로젝트의 설정 데이터를 
 * 저장, 로드, 삭제하는 역할을 담당하는 서비스 모듈입니다.
 */
export class StorageManager {
    
    // 프로젝트 목록을 저장하는 고정 키
    static PROJECT_LIST_KEY = 'docker_configs_list';
    static PROJECT_DATA_PREFIX = 'project_data_';
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
            // 💡 사용자에게 저장 공간 부족 알림 등을 제공할 수 있음
        }
    }

    /**
     * @description 저장된 프로젝트 목록을 불러옵니다. 없으면 빈 배열을 반환합니다.
     * @returns {Array<Object>}
     */
    loadProjectList() {
        try {
            const data = localStorage.getItem(StorageManager.PROJECT_LIST_KEY);
            // 데이터가 없거나 파싱 오류가 발생하면 빈 배열 반환
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error loading project list from localStorage:", error);
            return [];
        }
    }

    /**
     * @description 단일 프로젝트의 상세 설정(configData)을 저장합니다.
     * @param {string} projectId - 프로젝트의 고유 ID (localStorage의 키로 사용됨)
     * @param {Object} configData - state.configData 객체
     */
    saveProject(projectId, configData) {
        if (!projectId) return;
        try {
            const data = JSON.stringify(configData);
            const key = StorageManager.PROJECT_DATA_PREFIX + projectId; 
            localStorage.setItem(key, data);
            console.log(`프로젝트 ${projectId} 저장 완료`);
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
            const key = StorageManager.PROJECT_DATA_PREFIX + projectId;
            const data = localStorage.getItem(key);
            const loaded = data ? JSON.parse(data) : null;
            if (loaded) console.log(`프로젝트 ${projectId} 로드 완료`);
            return loaded;
        } catch (error) {
            console.error(`Error loading project ${projectId}:`, error);
            return null;
        }
    }

    /**
     * @description 특정 프로젝트와 해당 프로젝트 ID를 목록에서 모두 삭제합니다.
     * @param {string} projectId - 삭제할 프로젝트의 고유 ID
     */
    deleteProject(projectId) {
        if (!projectId) return;

        try {
            const key = StorageManager.PROJECT_DATA_PREFIX + projectId;
            localStorage.removeItem(key);
            
            let projectList = this.loadProjectList();
            projectList = projectList.filter(p => p.id !== projectId);
            this.saveProjectList(projectList);
            
            console.log(`프로젝트 ${projectId} 삭제 완료`);

        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
        }
    }
    
    /**
     * @description (기존 단일 저장 방식과의 호환성을 위해 남겨둡니다. 현재는 사용되지 않습니다.)
     */
    loadState() {
        // 단일 키 대신, 현재는 loadProject()를 사용해야 합니다.
        return null; 
    }
    saveState() {
        // 단일 키 대신, 현재는 saveProject()를 사용해야 합니다.
    }
}