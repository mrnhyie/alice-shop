import { forwardRef } from 'react';

const ICONS = {
  AlertCircle: 'error', ArrowLeft: 'arrow_back', ArrowRight: 'arrow_forward', ArrowUpRight: 'north_east',
  AutoAwesome: 'auto_awesome', AutoFixHigh: 'auto_fix_high',
  BarChart3: 'bar_chart', Bell: 'notifications', Check: 'check', CheckCircle2: 'check_circle', CheckSquare: 'check_box',
  Checkroom: 'checkroom', Celebration: 'celebration',
  ChevronDown: 'expand_more', ChevronLeft: 'chevron_left', ChevronRight: 'chevron_right', Clock: 'schedule',
  Copy: 'content_copy', CreditCard: 'credit_card', Diamond: 'diamond', Download: 'download',
  Eye: 'visibility', EyeOff: 'visibility_off',
  Facebook: 'thumb_up', Filter: 'filter_list', Flourish: 'local_florist', Globe2: 'public', Grid3X3: 'grid_view', Heart: 'favorite',
  Instagram: 'photo_camera', Image: 'image', LayoutDashboard: 'dashboard', List: 'view_list', Loader2: 'progress_activity', Lock: 'lock',
  LogOut: 'logout', Mail: 'mail', MapPin: 'location_on', Megaphone: 'campaign', Menu: 'menu', MessageSquare: 'chat',
  Minus: 'remove', Monitor: 'desktop_windows', NightLife: 'nightlife', Package: 'inventory_2', Palette: 'palette', Pause: 'pause', Pencil: 'edit',
  Phone: 'call', Play: 'play_arrow', Plus: 'add', RefreshCw: 'refresh', Search: 'search', Send: 'send', Shield: 'shield',
  Settings: 'settings', ShoppingBag: 'shopping_bag', ShoppingCart: 'shopping_cart', SlidersHorizontal: 'tune', Smartphone: 'smartphone',
  Spark: 'spark', SportsScore: 'sports_score', Star: 'star', Store: 'storefront',
  StyleIcon: 'style', SunIcon: 'wb_sunny', Tablet: 'tablet', Trash2: 'delete', TrendingUp: 'trending_up', Truck: 'local_shipping',
  Twitter: 'alternate_email', Upload: 'upload', User: 'person', UserPlus: 'person_add', Users: 'group',
  Volunteer: 'volunteer_activism', WbSunny: 'wb_sunny', X: 'close', Zap: 'bolt',
};

function MaterialIconBase({ name, size = 24, className = '', title, ...props }, ref) {
  return (
    <span
      ref={ref}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      title={title}
      className={`material-symbols-outlined inline-flex shrink-0 select-none leading-none ${className}`}
      style={{ fontSize: size, width: size, height: size, ...props.style }}
      {...props}
    >
      {ICONS[name] ?? name}
    </span>
  );
}

const MaterialIcon = forwardRef(MaterialIconBase);

const makeIcon = (name) => forwardRef((props, ref) => <MaterialIcon ref={ref} name={name} {...props} />);

export default MaterialIcon;
export const AlertCircle = makeIcon('AlertCircle'); export const ArrowLeft = makeIcon('ArrowLeft'); export const ArrowRight = makeIcon('ArrowRight'); export const ArrowUpRight = makeIcon('ArrowUpRight');
export const AutoAwesome = makeIcon('AutoAwesome'); export const AutoFixHigh = makeIcon('AutoFixHigh');
export const BarChart3 = makeIcon('BarChart3'); export const Bell = makeIcon('Bell'); export const Check = makeIcon('Check'); export const CheckCircle2 = makeIcon('CheckCircle2'); export const CheckSquare = makeIcon('CheckSquare');
export const Checkroom = makeIcon('Checkroom'); export const Celebration = makeIcon('Celebration');
export const ChevronDown = makeIcon('ChevronDown'); export const ChevronLeft = makeIcon('ChevronLeft'); export const ChevronRight = makeIcon('ChevronRight'); export const Clock = makeIcon('Clock'); export const Copy = makeIcon('Copy'); export const CreditCard = makeIcon('CreditCard'); export const Diamond = makeIcon('Diamond'); export const Download = makeIcon('Download');
export const Eye = makeIcon('Eye'); export const EyeOff = makeIcon('EyeOff'); export const Facebook = makeIcon('Facebook'); export const Filter = makeIcon('Filter'); export const Globe2 = makeIcon('Globe2'); export const Grid3X3 = makeIcon('Grid3X3'); export const Heart = makeIcon('Heart'); export const Instagram = makeIcon('Instagram'); export const Image = makeIcon('Image'); export const LayoutDashboard = makeIcon('LayoutDashboard'); export const List = makeIcon('List'); export const Loader2 = makeIcon('Loader2'); export const Lock = makeIcon('Lock'); export const LogOut = makeIcon('LogOut'); export const Mail = makeIcon('Mail'); export const MapPin = makeIcon('MapPin'); export const Megaphone = makeIcon('Megaphone'); export const Menu = makeIcon('Menu'); export const MessageSquare = makeIcon('MessageSquare'); export const Minus = makeIcon('Minus'); export const Monitor = makeIcon('Monitor'); export const NightLife = makeIcon('NightLife'); export const Package = makeIcon('Package'); export const Palette = makeIcon('Palette'); export const Pause = makeIcon('Pause'); export const Pencil = makeIcon('Pencil'); export const Phone = makeIcon('Phone'); export const Play = makeIcon('Play'); export const Plus = makeIcon('Plus'); export const RefreshCw = makeIcon('RefreshCw'); export const Search = makeIcon('Search'); export const Send = makeIcon('Send'); export const Settings = makeIcon('Settings'); export const Shield = makeIcon('Shield'); export const ShoppingBag = makeIcon('ShoppingBag'); export const ShoppingCart = makeIcon('ShoppingCart'); export const SlidersHorizontal = makeIcon('SlidersHorizontal'); export const Smartphone = makeIcon('Smartphone'); export const SportsScore = makeIcon('SportsScore'); export const Star = makeIcon('Star'); export const Store = makeIcon('Store'); export const StyleIcon = makeIcon('StyleIcon'); export const SunIcon = makeIcon('SunIcon'); export const Tablet = makeIcon('Tablet'); export const Trash2 = makeIcon('Trash2'); export const TrendingUp = makeIcon('TrendingUp'); export const Truck = makeIcon('Truck'); export const Twitter = makeIcon('Twitter'); export const Upload = makeIcon('Upload'); export const User = makeIcon('User'); export const UserPlus = makeIcon('UserPlus'); export const Users = makeIcon('Users'); export const Volunteer = makeIcon('Volunteer'); export const WbSunny = makeIcon('WbSunny'); export const X = makeIcon('X'); export const Zap = makeIcon('Zap');
