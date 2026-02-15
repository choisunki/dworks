import video, {
  create,
  controlVideo,
  vdoTag,
  icons,
  calcAspectPad,
} from './modules/video.js';

var mod = {
  video: video,
  createVideo: create,
  utils: {
    controlVideo: controlVideo,
    vdoTag: vdoTag,
    calcAspectPad: calcAspectPad,
    icons: icons,
  },
};

if (typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined') {
  globalThis.DWorks = globalThis.DWorks || mod;
}

export { video, create, controlVideo, vdoTag, icons, calcAspectPad };
export default mod;
