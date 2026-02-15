# dworks

GitHub/NPM 기반 CDN 배포를 위한 브라우저 모듈 저장소입니다.

## Structure

- `src/modules/video.js`: 비디오 모듈 소스
- `src/index.js`: 전체 엔트리(향후 모듈 확장 지점)
- `scripts/build.mjs`: 빌드/미니파이 스크립트
- `dist/*`: 배포 산출물 (일반 + minified + esm)

## Build

```bash
npm install
npm run build
```

## Dist files

- `dist/dworks.min.js`: 전체 모듈 CDN 기본 파일
- `dist/dworks-video.min.js`: 비디오 모듈 단독 CDN 파일
- `dist/*.esm.js`: ESM 용 파일

## CDN usage (GitHub tag)

```html
<script src="https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag>/dist/dworks-video.min.js"></script>
<script>
  // window.DWorksVideo 사용
  const videoModule = window.DWorksVideo;
</script>
```

## CDN usage (npm publish 후)

```html
<script src="https://cdn.jsdelivr.net/npm/dworks@0.1.0/dist/dworks-video.min.js"></script>
```

## Release flow

1. `npm run build`
2. `dist` 변경사항 커밋
3. Git tag 생성 후 GitHub push
4. (선택) npm publish

