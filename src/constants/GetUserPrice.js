function GetUserPrice({ user, item }) {
  let price;

  switch (user?.account_type) {
    case 'subscriber':
      price = item?.userprice;
      break;
    case 'agent':
      price = item?.agentprice;
      break;
    case 'vendor':
      price = item?.vendorprice;
      break;
    case 'dealer':
      price = item?.dealerprice;
      break;
    default:
      price = item?.userprice;
  }
  return price;
}

export default GetUserPrice;

export const GetCurrentUserPrice = ({ user, data: p }) => {
  let price;
  switch (user?.account_type?.toLowerCase()) {
    case 'subscriber':
      price = p?.userprice;
      break;
    case 'agent':
      price = p?.agentprice;
      break;
    case 'vendor':
      price = p?.vendorprice;
      break;
    default:
      price = p?.userprice;
  }
  return price;
};

/** Kirani/Ratel plans use user/agent/vendor (not userprice/agentprice). */
export function GetTieredPlanPrice({ user, plan }) {
  const type = String(user?.account_type || '').toLowerCase();
  if (type === 'agent') return plan?.agent ?? plan?.price;
  if (type === 'vendor' || type === 'dealer') return plan?.vendor ?? plan?.price;
  return plan?.user ?? plan?.price;
}

export function getPlanDisplayLabel(plan, user) {
  const price = GetTieredPlanPrice({ user, plan });
  const code = plan?.plan || plan?.id;
  if (plan?.name) return `${plan.name} — ₦${price}`;
  return `Plan ${code} — ₦${price}`;
}
