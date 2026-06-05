import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import regionService from '../../services/regionService';
import cityService from '../../services/cityService';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import './LocationFilter.css';

const LocationFilter = ({ onFilterChange }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch regions on mount
  useEffect(() => {
    regionService.getRegions()
      .then(data => setRegions(data))
      .catch(err => console.error('Failed to load regions:', err));
  }, []);

  // Fetch cities when region changes
  useEffect(() => {
    if (selectedRegionId) {
      setLoadingCities(true);
      cityService.getCities(selectedRegionId)
        .then(data => {
          setCities(data);
          setLoadingCities(false);
        })
        .catch(err => {
          console.error('Failed to load cities:', err);
          setLoadingCities(false);
        });
    } else {
      setCities([]);
    }
  }, [selectedRegionId]);

  const handleRegionChange = (value) => {
    // value is '' (clear) or a region id string
    const regionId = value ? Number(value) : null;
    setSelectedRegionId(value);
    setSelectedCityId('');
    onFilterChange({ regionId, cityId: null });
  };

  const handleCityChange = (value) => {
    const cityId = value ? Number(value) : null;
    setSelectedCityId(value);
    onFilterChange({ regionId: selectedRegionId ? Number(selectedRegionId) : null, cityId });
  };

  const getRegionName = (region) => isArabic ? region.nameAr : region.nameEn;
  const getCityName = (city) => isArabic ? city.nameAr : city.nameEn;

  // Prepend an "All regions" option
  const regionOptions = [
    { id: '', nameEn: t('locationFilter.allRegions', 'All Regions'), nameAr: t('locationFilter.allRegions', 'كل المناطق') },
    ...regions,
  ];

  const cityOptions = [
    { id: '', nameEn: t('locationFilter.allCities', 'All Cities'), nameAr: t('locationFilter.allCities', 'كل المدن') },
    ...cities,
  ];

  return (
    <div className="location-filter">
      <div className="location-filter-container">
        <div className="location-dropdowns">
          {/* Region dropdown */}
          <div className="location-dropdown-wrap">
            <SearchableSelect
              options={regionOptions}
              value={selectedRegionId}
              onChange={handleRegionChange}
              placeholder={t('locationFilter.allRegions', 'كل المناطق')}
              icon={<MapPin size={16} />}
              getOptionLabel={(opt) => isArabic ? opt.nameAr : opt.nameEn}
              getOptionValue={(opt) => opt.id}
              showSearch={false}
            />
          </div>

          {/* City dropdown — only shown after a region is selected */}
          {selectedRegionId && (
            <div className="location-dropdown-wrap">
              <SearchableSelect
                options={cityOptions}
                value={selectedCityId}
                onChange={handleCityChange}
                placeholder={loadingCities ? t('common.loading', 'Loading...') : t('locationFilter.allCities', 'كل المدن')}
                disabled={loadingCities}
                getOptionLabel={(opt) => isArabic ? opt.nameAr : opt.nameEn}
                getOptionValue={(opt) => opt.id}
                showSearch={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFilter;
