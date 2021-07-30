# GitHub Organization Invitation

## Installation

```bash
git clone https://github.com/pers0n4/github-organization-invitation.git

cd github-organization-invitation

yarn && yarn build
# or
npm install && npm run build
```

## Usage

1. `.env`에 `admin:org` 권한을 포함한 GITHUB_TOKEN 설정
2. `input.txt`에 그룹에 추가할 `username` 또는 `email` 목록 입력 (줄 바꿈으로 구분)
3. `ORG=organization node dist/main.js`
