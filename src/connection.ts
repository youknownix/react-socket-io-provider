import {Socket as SocketIO, Manager, ManagerOptions} from 'socket.io-client';

export interface SocketArgs {
  uri: string;
  namespace: string;
  opts?: Partial<ManagerOptions>;
  auth?: Record<string, string>;
}

export class Socket {
  _manager: Manager | null = null;
  _socket: SocketIO | null = null;

  private authRecord: Record<string, string> | undefined;
  private namespace: string | undefined;

  constructor({uri, opts, auth, namespace}: SocketArgs) {
    this._manager = new Manager(uri, {
      forceNew: true,
      autoConnect: false,
      ...opts,
    });

    this.authRecord = auth;
    this.namespace = namespace;
  }

  intializeSocket() {
    if (!this.namespace) return;

    if (this._socket !== null) {
      if (this._socket?.connected) {
        this._socket?.disconnect();
        this._manager?._destroy(this._socket);
      }
      this._socket = null;
    }

    if (this._manager) {
      this._socket = this._manager.socket(this.namespace, {
        auth: this.authRecord,
      });
    }
  }

  connect(): void {
    if (this._socket) {
      this._socket.connect();
    }
  }

  disconnect(): void {
    if (this._manager && this._socket) {
      this._manager._close();
      this._manager._destroy(this._socket);
    }
  }

  destroy(): void {
    if (this._manager && this._socket) {
      this._manager._destroy(this._socket);
    }
  }

  onOpen(cb: () => any) {
    if (this._socket) {
      this._socket.on('connect', cb);
    }

    const removeListener = () => {
      if (this._socket) {
        this._socket.off('connect', cb);
      }
    };

    return {removeListener};
  }

  onClose(cb: (reason: string, description) => any) {
    if (this._manager) {
      this._manager.on('close', cb);
    }

    const removeListener = () => {
      if (this._manager) {
        this._manager.off('close', cb);
      }
    };

    return {removeListener};
  }
}
