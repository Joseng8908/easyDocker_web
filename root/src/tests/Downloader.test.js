import { Downloader } from '../services/Downloader.js';

describe('Downloader TDD Test', () => {
    let downloader;

    // 테스트 환경 설정 (beforeEach, beforeAll)
    beforeEach(() => {
        // Downloader 인스턴스 생성
        downloader = new Downloader();
        
        // 브라우저의 document.createElement('a') 및 click() 메소드를 모킹
        // 실제 다운로드가 실행되지 않도록 가짜 함수로 대체합니다.
        global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
        global.URL.revokeObjectURL = jest.fn();
        global.document.createElement = jest.fn(() => ({
            href: '',
            download: '',
            click: jest.fn(),
            remove: jest.fn(),
        }));
    });

    // 1. 단일 파일 저장 기능 테스트 (성공 케이스)
    test('saveFile should correctly initiate a single file download', () => {
        const filename = 'Dockerfile';
        const content = 'FROM node:18';
        
        // 🚨 테스트 실행
        downloader.saveFile(filename, content);

        // 💡 예상 결과 (Assertions):
        // 1. Blob 객체가 생성되었는지 확인
        // 2. 가짜 <a> 태그의 download 속성이 올바른지 확인
        // 3. <a> 태그의 click() 메소드가 호출되었는지 확인

        expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(document.createElement().download).toBe(filename);
        expect(document.createElement().click).toHaveBeenCalled();
    });

    // 2. 파일 목록을 받아 zip으로 압축 저장 기능 테스트 (프로토타입)
    test.skip('saveZip should eventually zip and download multiple files', () => {
        const files = [
            { name: 'Dockerfile', content: '...' },
            { name: 'Makefile', content: '...' },
        ];

        // 🚨 테스트 실행
        // downloader.saveZip(files);
        
        // 💡 예상 결과 (Assertions):
        // (Zip 라이브러리 통합 후 구체화 예정)
    });
});