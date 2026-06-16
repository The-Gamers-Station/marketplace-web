const DEFAULT_WEBSITE_NAME = 'Gamers Station';
const DEFAULT_AD_DESCRIPTION_SUFFIX = ' (تصفح المزيد من عروض الجيمرز على موقع جيمرز ستيشن)';

export const buildAdDynamicMeta = ({
  title,
  city,
  description,
  websiteName = DEFAULT_WEBSITE_NAME,
  descriptionSuffix = DEFAULT_AD_DESCRIPTION_SUFFIX,
} = {}) => ({
  title: title || '',
  city: city || '',
  description: description || '',
  websiteName,
  descriptionSuffix,
});

export default {
  buildAdDynamicMeta,
};
