// Each entry maps a bank object on the user profile to the value the
// create-virtual-account endpoint expects in its `bank` field.
export const VIRTUAL_BANKS = [
  {
    key: 'wemabank',
    label: 'Wema Bank',
    param: 'wema',
    buttonText: 'Get Wema Bank',
  },
  {
    key: 'moniepointbank',
    label: 'Moniepoint Bank',
    param: 'moniepoint',
    buttonText: 'Get Moniepoint Bank',
    chargesType: 'flat',
  },
  {
    key: 'sterlingbank',
    label: 'Sterling Bank',
    param: 'sterling',
    buttonText: 'Get Sterling Bank',
  },
  {
    key: 'fidelitybank',
    label: 'Fidelity Bank',
    param: 'fidelity',
    buttonText: 'Get Fidelity Bank',
  },
  {
    key: 'gtbank',
    label: 'GT Bank',
    param: 'gt',
    buttonText: 'Get GT Bank',
  },
  {
    key: 'ninepsbbank',
    label: '9PSB Bank',
    param: 'ninepsb',
    buttonText: 'Get 9psb',
  },
  {
    key: 'palmpay',
    label: 'Palmpay Bank',
    param: 'palmpay',
    buttonText: 'Get Palmpay',
  },
  {
    key: 'palmpay_billstack',
    label: 'Palmpay Billstack',
    param: 'palmpay_billstack',
    buttonText: 'Get Palmpay',
  },
  {
    key: 'ninepsbbank_billstack',
    label: '9psb Billstack',
    param: 'ninepsbbank_billstack',
    buttonText: 'Get 9psb',
  },
  {
    key: 'bankly_billstack',
    label: 'Bankly',
    param: 'bankly_billstack',
    buttonText: 'Get Bankly',
  },
  {
    key: 'ninepsbbank_payscribe',
    label: '9psb',
    param: 'ninepsbbank_payscribe',
    buttonText: 'Get 9psb',
  },
  {
    key: 'paga_strowallet',
    label: 'Paga',
    param: 'paga_strowallet',
    buttonText: 'Get Paga',
  },
  {
    key: 'bankly_strowallet',
    label: 'Bankly',
    param: 'bankly_strowallet',
    buttonText: 'Get Bankly',
  },
  {
    key: 'safeheaven_strowallet',
    label: 'Safeheaven',
    param: 'safeheaven_strowallet',
    buttonText: 'Get Safeheaven',
  },
  {
    key: 'palmpay_topupmate',
    label: 'Palmpay',
    param: 'palmpay_topupmate',
    buttonText: 'Get Palmpay',
  },
  {
    key: 'kredi_topupmate',
    label: 'Kredi',
    param: 'kredi_topupmate',
    buttonText: 'Get Kredi',
  },
];

export const isBankOn = (bank) => String(bank?.status ?? '').toLowerCase() === 'on';

export const hasAccount = (bank) => {
  const account = bank?.account;
  return account !== null && account !== undefined && String(account).trim() !== '';
};

export const getEnabledBanks = (user) =>
  VIRTUAL_BANKS.filter((bank) => isBankOn(user?.[bank.key]));

// Every account the user already has, in the order the banks are listed above.
export const getVirtualAccounts = (user) =>
  getEnabledBanks(user)
    .filter((bank) => hasAccount(user?.[bank.key]))
    .map((bank) => ({ ...bank, account: String(user?.[bank.key]?.account) }));

export const getPendingBanks = (user) =>
  getEnabledBanks(user).filter((bank) => !hasAccount(user?.[bank.key]));
