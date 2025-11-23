// ===========================================
// src/services/StorageManager.js
// ===========================================
/**
 * Web Storage API(localStorage)를 사용하여 애플리케이션 상태를 관리하는 클래스.
 */

export class StorageManager {
    constructor(key = 'dockerfileGeneratorState') {
        this.storageKey = key;
    }

    /**
     * 현재 상태 객체를 localStorage에 저장합니다.
     * @param {Object} state - 저장할 상태 객체
     */
    saveState(state) {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(this.storageKey, serializedState);
            // 저장 성공 로그
            console.log("State saved to localStorage.");
        } catch (error) {
            console.error('Error saving state to localStorage:', error);
        }
    }

    /**
     * localStorage에서 상태 객체를 불러옵니다.
     * @returns {Object|null} 불러온 상태 객체 또는 null
     */
    loadState() {
        try {
            const serializedState = localStorage.getItem(this.storageKey);
            if (serializedState === null) {
                return null;
            }
            const state = JSON.parse(serializedState);
            // 불러오기 성공 로그
            console.log("State loaded from localStorage.");
            return state;
        } catch (error) {
            console.error('Error loading state from localStorage:', error);
            return null;
        }
    }

    /**
     * localStorage에서 상태 객체를 삭제합니다.
     */
    clearState() {
        try {
            localStorage.removeItem(this.storageKey);
            // 삭제 성공 로그
            console.log("State cleared from localStorage.");
        } catch (error) {
            console.error('Error clearing state from localStorage:', error);
        }
    }
}