"""
간단한 Figma API 접근 테스트
"""

import requests
from pathlib import Path


def test_figma_access(token: str = None, file_id: str = None) -> bool:
    """Figma API 접근 테스트

    Args:
        token: Figma 액세스 토큰 (없으면 .env에서 읽기 시도)
        file_id: Figma 파일 ID (없으면 .env에서 읽기 시도)
    """
    # 1. 토큰과 파일 ID 가져오기
    if not token or not file_id:
        try:
            env_path = Path.cwd().parent / ".env"
            if not env_path.exists():
                print("❌ .env 파일 없음")
                return False

            with open(env_path) as f:
                for line in f:
                    if line.startswith("FIGMA_ACCESS_TOKEN="):
                        token = line.split("=", 1)[1].strip()
                    elif line.startswith("FIGMA_FILE_ID="):
                        file_id = line.split("=", 1)[1].strip()
        except Exception as e:
            print(f"❌ .env 파일 읽기 실패: {e}")
            return False

    if not token or not file_id:
        print("❌ 토큰 또는 파일 ID 없음")
        return False

    # 2. API 요청
    try:
        url = f"https://api.figma.com/v1/files/{file_id}/versions"
        headers = {"X-Figma-Token": token}

        print(f"🔍 API 테스트 중... (파일 ID: {file_id})")
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            print("✅ API 접근 성공!")
            return True

        print(f"❌ API 오류: {response.json()}")
        return False

    except Exception as e:
        print(f"❌ 요청 실패: {e}")
        return False


if __name__ == "__main__":
    test_figma_access()
