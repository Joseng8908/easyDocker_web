// ===========================================
// src/services/Downloader.js (saveFile 함수 구현)
// ===========================================

export class Downloader {

    /**
     * 파일 내용을 Blob으로 만들고 다운로드를 시작합니다.
     * @param {string} filename - 파일 이름 (예: Dockerfile)
     * @param {string} content - 파일 내용 (텍스트)
     */
    saveFile(filename, content) {
        // 1. Blob 객체 생성
        // 'text/plain' MIME 타입으로 인코딩된 파일 내용을 담습니다.
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        
        // 2. Blob URL 생성
        const url = URL.createObjectURL(blob);
        
        // 3. 임시 <a> 태그 생성 및 설정
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; // 다운로드될 파일 이름 설정
        
        // 4. DOM에 추가 후 click 이벤트 발생 (다운로드 트리거)
        document.body.appendChild(link); // 일부 브라우저에서 필요
        link.click();
        
        // 5. 사용 후 정리
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // 메모리 누수 방지를 위해 URL 해제
    }

    /**
     * 여러 파일을 Zip으로 압축하여 다운로드합니다. (추후 구현)
     */
    saveZip(files) {
        throw new Error("Zip 다운로드 기능은 현재 구현되지 않았습니다.");
    }
}