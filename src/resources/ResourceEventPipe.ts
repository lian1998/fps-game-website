class ResourceEventPipe extends EventTarget { }

export const rep = new ResourceEventPipe();

/** 资源成功加载 */
export const _resourceLoaded = new CustomEvent('resourceLoaded', { detail: { name: '', obj: null } });