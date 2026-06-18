export type NavigationStartOptions = {
  showOverlay?: boolean;
};

type NavigationProgressHandlers = {
  start: (options?: NavigationStartOptions) => void;
  cancel: () => void;
};

let handlers: NavigationProgressHandlers | null = null;

export function registerNavigationProgressHandlers(
  next: NavigationProgressHandlers,
) {
  handlers = next;
  return () => {
    if (handlers === next) handlers = null;
  };
}

export function startNavigationProgress(options?: NavigationStartOptions) {
  handlers?.start(options);
}

export function cancelNavigationProgress() {
  handlers?.cancel();
}
