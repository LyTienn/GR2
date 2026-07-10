import { useTranslation } from 'react-i18next';

export const useRelativeTime = () => {
  const { t } = useTranslation();

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 0) return t('time.justNow');
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    const diffWks = Math.floor(diffDays / 7);
    const diffMths = Math.floor(diffDays / 30);
    const diffYrs = Math.floor(diffDays / 365);

    if (diffSecs < 60) {
      return t('time.justNow');
    }
    if (diffMins < 60) {
      return t('time.minsAgo', { count: diffMins });
    }
    if (diffHrs < 24) {
      return t('time.hrsAgo', { count: diffHrs });
    }
    if (diffDays < 7) {
      return t('time.daysAgo', { count: diffDays });
    }
    if (diffWks < 4) {
      return t('time.wksAgo', { count: diffWks });
    }
    if (diffMths < 12) {
      return t('time.mosAgo', { count: diffMths });
    }
    return t('time.yrsAgo', { count: diffYrs });
  };

  return formatRelativeTime;
};
