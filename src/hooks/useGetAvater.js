import { useState, useEffect } from 'react';
import { AvatarList } from '../constants/AvaterList';
import { GetData } from '../constants/storage';

const useGetAvatar = () => {
  const [avatar, setAvatar] = useState(require(`../assets/avaters/1.png`));

  const fetchAvatar = async () => {
    const avtr = await GetData('avatar');
    if (avtr) {
      const foundAvatar = AvatarList.find((item) => item.id === avtr);
      if (foundAvatar) {
        setAvatar(foundAvatar.image);
      }
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);

  return avatar;
};

export default useGetAvatar;
