import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleDataModel } from '../../store/globalState';
import { isFeatureOn } from '../../constants/FeatureAccess';
import { pickNativeContactPhone } from '../../utils/nativeContactPicker';
import { createScopedDebugger } from '../../utils/debugScopes';

const __debug = createScopedDebugger('BUY_DATA');

const __safeLast4 = (v) => {
  if (!v) return '';
  const s = String(v);
  return s.length <= 4 ? s : s.slice(-4);
};

export const useData = () => {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [phone, setPhone] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const [network, setNetwork] = useState(0);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [searchedPlan, setSearchedPlan] = useState('');
  const [searchedPlans, setSearchedPlans] = useState([]);
  const [error, setError] = useState({
    data: '',
    phone: '',
    option: '',
  });

  const phoneNumber = route.params.phone;
  const { dataPlans, netWorkSettings, user, contact, features } = useSelector(
    (state) => state.globalState
  );
  const [utilityItems, setUtilityItems] = useState([]);
  const [data, setData] = useState([]);
  const sheetRef = useRef(null);

  useEffect(() => {
    console.log('[BUY_DATA_DEBUG]', 'useData hook mounted');
  }, []);

  useEffect(() => {
    console.log('[BUY_DATA_DEBUG]', 'useData: derive types for network', { network });
    __debug('[BUY_DATA][HOOK] derive types for network', {
      network,
      netWorkSettingsCount: Array.isArray(netWorkSettings)
        ? netWorkSettings.length
        : undefined,
    });
    const newType = netWorkSettings
      .filter((dataItem) => parseInt(dataItem.nId) === network)
      .map((dataItem) => {
        const n = [];

        if (dataItem.smeStatus?.toLowerCase() === 'on') {
          n.push(dataItem.smeplanName || 'SME');
        }
        if (dataItem.corporateStatus?.toLowerCase() === 'on') {
          n.push(dataItem.corporateplanName || 'Corporate');
        }
        if (dataItem.giftingStatus?.toLowerCase() === 'on') {
          n.push(dataItem.giftingplanName || 'Gifting');
        }
        if (isFeatureOn(features, 'extradatatypes')) {
          if (dataItem.extraplanoneStatus?.toLowerCase() === 'on') {
            n.push(dataItem.extraplanoneName || 'Extra Plan One');
          }
          if (dataItem.extraplantwoStatus?.toLowerCase() === 'on') {
            n.push(dataItem.extraplantwoName || 'Extra Plan Two');
          }
          if (dataItem.extraplanthreeStatus?.toLowerCase() === 'on') {
            n.push(dataItem.extraplanthreeName || 'Extra Plan Three');
          }
          if (dataItem.extraplanfourStatus?.toLowerCase() === 'on') {
            n.push(dataItem.extraplanfourName || 'Extra Plan Four');
          }
        }

        return n;
      })
      .flat();

    setData(newType);
  }, [network, netWorkSettings, features]);

  useEffect(() => {
    __debug('[BUY_DATA][HOOK] option changed -> filtering plans', {
      network,
      selectedOption,
      dataPlansCount: Array.isArray(dataPlans) ? dataPlans.length : undefined,
    });
    setError((prevErrors) => ({ ...prevErrors, option: false }));
    const filteredPlans = dataPlans.filter((dataItem) => {
      const isMatchingNetwork = parseInt(dataItem.datanetwork) === network;
      const isMatchingType = dataItem.type === selectedOption;
      return isMatchingNetwork && isMatchingType;
    });

    __debug('[BUY_DATA][HOOK] filtered plans ready', {
      network,
      selectedOption,
      filteredCount: Array.isArray(filteredPlans) ? filteredPlans.length : 0,
      firstPlan: filteredPlans?.[0],
    });
    setUtilityItems(filteredPlans);
  }, [selectedOption, dataPlans, network]);

  useEffect(() => {
    __debug('[BUY_DATA][HOOK] network changed -> reset selections', {
      network,
    });
    setSelectedOption(null);
    setSelectedData(null);
  }, [network]);

  useEffect(() => {
    if (utilityItems.length === 0) {
      return;
    }
    const sterm = searchedPlan.toLowerCase();
    __debug('[BUY_DATA][HOOK] search term changed -> filter visible plans', {
      sterm,
      total: utilityItems.length,
    });
    const filteredPlans = utilityItems.filter(
      (dataItem) =>
        dataItem?.name.toLowerCase().includes(sterm) ||
        dataItem?.userprice.toLowerCase().includes(sterm) ||
        dataItem?.agentprice.toLowerCase().includes(sterm) ||
        dataItem?.vendorprice.toLowerCase().includes(sterm)
    );

    __debug('[BUY_DATA][HOOK] search results', {
      sterm,
      count: filteredPlans.length,
      first: filteredPlans?.[0],
    });
    setSearchedPlans(filteredPlans);
  }, [utilityItems, searchedPlan]);

  const clearError = (field) => {
    __debug('[BUY_DATA][UI] clearError', { field });
    setError((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  const handleToggleModal = () => {
    const attemptId = `DATA_UI_${Date.now()}`;
    __debug('[BUY_DATA][UI] Purchase pressed -> validate before opening modal', {
      attemptId,
      network,
      phoneLast4: __safeLast4(phone),
      hasPhone: Boolean(phone?.trim()),
      selectedOption,
      selectedDataPlanId: selectedData?.planid,
      selectedDataPid: selectedData?.pId,
      selectedDataName: selectedData?.name,
      selectedDataType: selectedData?.type,
    });
    const errors = {};

    if (phone.trim() === '') {
      errors.phone = 'Phone Number cannot be empty';
    }

    if (!selectedOption) {
      errors.option = 'Please Select Data type';
    }

    if (!selectedData) {
      errors.data = 'Please Select data plan';
    }

    setError(errors);

    if (Object.keys(errors).length === 0) {
      console.log('[BUY_DATA_DEBUG]', 'useData: Purchase validation OK, open modal', {
        attemptId,
        planid: selectedData?.planid,
      });
      __debug('[BUY_DATA][UI] validation ok -> opening pin/biometric modal', {
        attemptId,
      });
      dispatch(toggleDataModel());
    } else {
      console.log('[BUY_DATA_DEBUG]', 'useData: Purchase validation failed', {
        attemptId,
        errors,
      });
      __debug('[BUY_DATA][UI] validation failed', { attemptId, errors });
    }
  };

  function handleUtility(item) {
    console.log('[BUY_DATA_DEBUG]', 'useData: plan picked from list', {
      planid: item?.planid,
      name: item?.name,
      type: item?.type,
    });
    __debug('[BUY_DATA][UI] data plan selected', {
      planid: item?.planid,
      pId: item?.pId,
      name: item?.name,
      type: item?.type,
      datanetwork: item?.datanetwork,
      day: item?.day,
      userprice: item?.userprice,
      agentprice: item?.agentprice,
      vendorprice: item?.vendorprice,
    });
    clearError('data');
    setSelectedData(item);
    setBottomSheetVisible(false);
  }

  const snapPoints = useMemo(() => ['20%', '90%'], []);

  // callbacks
  const handleSheetChange = useCallback(
    (index) => {
      __debug('[BUY_DATA][UI] bottom sheet index changed', { index });
      if (index === 0) {
        setBottomSheetVisible(false);
      }
    },
    [sheetRef]
  );

  const handleSnapPress = useCallback((index) => {
    __debug('[BUY_DATA][UI] open plan picker', {
      selectedOption,
      network,
    });
    setBottomSheetVisible(true);
    sheetRef.current?.snapToIndex(1);
    setError((prevErrors) => ({ ...prevErrors, data: false }));
  }, []);

  const handleClosePress = useCallback(() => {
    __debug('[BUY_DATA][UI] close bottom sheet');
    sheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (contact?.network) {
      __debug('[BUY_DATA][UI] restoring network from contact state', {
        network: contact?.network,
      });
      setNetwork(contact?.network);
    }

    if (contact?.selectedOption) {
      __debug('[BUY_DATA][UI] restoring option from contact state', {
        selectedOption: contact?.selectedOption,
      });
      setSelectedOption(contact?.selectedOption);
    }
    if (contact?.selectedData) {
      __debug('[BUY_DATA][UI] restoring plan from contact state', {
        planid: contact?.selectedData?.planid,
        pId: contact?.selectedData?.pId,
        name: contact?.selectedData?.name,
        type: contact?.selectedData?.type,
      });
      setSelectedData(contact?.selectedData);
    }
    if (contact?.number) {
      __debug('[BUY_DATA][UI] restoring phone from contact state', {
        phoneLast4: __safeLast4(contact?.number),
      });
      setPhone(contact?.number);
    }
  }, []);

  const handleSelectContact = async () => {
    try {
      __debug('[BUY_DATA][UI] select contact pressed');
      const result = await pickNativeContactPhone();
      __debug('[BUY_DATA][UI] contact picker result', {
        hasNumber: Boolean(result?.number),
        numberLast4: __safeLast4(result?.number),
      });
      if (result?.number) setPhone(result.number);
    } catch (err) {
      __debug('[BUY_DATA][UI] contact picker error/cancel', {
        message: err?.message,
        name: err?.name,
      });
      // User cancelled or permission denied
    }
  };

  return {
    handleSheetChange,
    handleSnapPress,
    handleClosePress,
    setSelectedOption,
    setPhone,
    handleToggleModal,
    handleUtility,
    clearError,
    setNetwork,
    handleSnapPress,
    handleSelectContact,
    isBottomSheetVisible,
    network,
    selectedOption,
    snapPoints,
    phone,
    error,
    selectedData,
    utilityItems,
    data,
    navigation,
    sheetRef,
    user,
    selectedOption,
    searchedPlan,
    searchedPlans,
    setSearchedPlan,
    setBottomSheetVisible,
  };
};
