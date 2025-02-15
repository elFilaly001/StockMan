// This file is a fallback for using MaterialIcons on Android and web.

import { MaterialIcons, FontAwesome ,Ionicons  } from '@expo/vector-icons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';
// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.circle.fill': 'account-circle',
  'person.badge.plus.fill': 'person-add',
  'camera.fill': 'camera',
  'qrcode.viewfinder': 'qr-code-scanner',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'chart.bar.fill': 'bar-chart',
  'barcode.viewfinder': 'view-array',
  'box.fill': 'inventory',
  'shelves.fill': 'shelves',
} as const;

// Separate mapping for FontAwesome icons
const FA_MAPPING = {
  'barcode': 'barcode'
} as const;

const ION_MAPPING = {
  'barcode': 'barcode',
  "stats.fill" : "stats-chart-sharp"
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
