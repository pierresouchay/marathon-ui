const VolumesConstants = {
  TYPES: {
    DOCKER: "DOCKER",
    PERSISTENT: "PERSISTENT",
    EXTERNAL: "EXTERNAL"
  },
  STATUS: {
    ATTACHED: "Attached",
    DETACHED: "Detached",
    UNAVAILABLE: "Unavailable"
  }
};

export default Object.freeze(VolumesConstants);
