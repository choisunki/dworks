# dworks

GitHub/NPM 기반 CDN 배포를 위한 브라우저 모듈 저장소입니다.

## Structure

- `src/modules/video.js`: 비디오 모듈 소스
- `src/modules/youtube.js`: 유튜브 모듈 소스
- `src/modules/media-bridge.js`: 비디오/유튜브 브릿지 모듈 소스
- `src/index.js`: 전체 엔트리(향후 모듈 확장 지점)
- `scripts/build.mjs`: 빌드/미니파이 스크립트
- `src/scss/video.scss`: 비디오 전용 스타일 소스
- `dist/*`: 배포 산출물 (js + css)

## Build

```bash
npm install
npm run build
```

## Dist files

- `dist/dworks.min.js`: 전체 모듈 CDN 기본 파일
- `dist/dworks-video.min.js`: 비디오 모듈 단독 CDN 파일
- `dist/dworks-youtube.min.js`: 유튜브 모듈 단독 CDN 파일
- `dist/dworks-media-bridge.min.js`: 미디어 브릿지 모듈 단독 CDN 파일
- `dist/dworks-video.css`: 비디오 전용 스타일 파일
- `dist/dworks-video.min.css`: 비디오 전용 미니파이 스타일 파일
- `dist/*.esm.js`: ESM 용 파일

## NPM exports

```js
import DWorks from 'dworks';
import DWorksVideo from 'dworks/video';
import DWorksYoutube from 'dworks/youtube';
import DWorksMediaBridge from 'dworks/media-bridge';
import 'dworks/video.css';
```

## CDN usage (GitHub tag)

```html
<script src="https://cdn.jsdelivr.net/gh/<owner>/<repo>@v1.1.1/dist/dworks-video.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/<owner>/<repo>@v1.1.1/dist/dworks-youtube.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/<owner>/<repo>@v1.1.1/dist/dworks-media-bridge.min.js"></script>
```

## CDN usage (npm)

```html
<script src="https://cdn.jsdelivr.net/npm/dworks@1.1.1/dist/dworks-video.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dworks@1.1.1/dist/dworks-youtube.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dworks@1.1.1/dist/dworks-media-bridge.min.js"></script>
```

## Release flow

1. `npm run build`
2. `dist` 변경사항 커밋
3. Git tag 생성 후 GitHub push
4. (선택) npm publish
