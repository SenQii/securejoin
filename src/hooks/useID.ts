import { useState, useEffect } from 'react';
import { v4 as UUID } from 'uuid';

export function useID() {
  const [ip, setIP] = useState<string>('');

  useEffect(() => {
    const getIP = () => {
      const cachedIP = localStorage.getItem('user_id');

      // CASE: its in LS
      if (cachedIP) {
        setIP(cachedIP);
        return;
      }

      // CASE: not... ad new uuid
      const newUUID = UUID();
      localStorage.setItem('user_id', newUUID);
      setIP(newUUID);
    };

    getIP();
  }, []);

  return ip;
}
