import React, {ReactNode, createContext, useCallback, useState} from 'react';
import {Socket} from 'src/connection';

export interface SocketContext {
  Socket?: Socket;
  isSocketConnected: boolean;
  switchSocketConnection: (connectionStatus: boolean) => void;
}

export const SocketContext = createContext<SocketContext>({
  isSocketConnected: false,
  switchSocketConnection: () => false,
});

export function SocketProvider({
  children,
  socketInstance,
}: {
  children: ReactNode;
  socketInstance: Socket;
}) {
  const [isSocketConnected, _switchSocketConnection] = useState(false);

  const switchSocketConnection = useCallback((connectionStatus: boolean) => {
    _switchSocketConnection(connectionStatus);
  }, []);

  const _onOpen = useCallback(() => {
    if (contextUser) {
      // if (__DEV__) {
      //   console.log(
      //     'Socket connection established',
      //     CoreSocketInstance._socket?.id,
      //   );
      // }

      _switchSocketConnection(true);
    } else {
      if (__DEV__) {
        console.log('no context user to establish connection');
      }
    }
  }, [contextUser]);

  const _onClose = useCallback((reason: string, description) => {
    console.log('Socket Disconnected -> reason', reason);
    console.log('Socket Disconnected -> description', description);

    _switchSocketConnection(false);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        Socket: socketInstance,
        isSocketConnected,
        switchSocketConnection,
      }}>
      {children}
    </SocketContext.Provider>
  );
}
