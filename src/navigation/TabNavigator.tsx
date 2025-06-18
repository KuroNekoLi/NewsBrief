import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { HeadlinesScreen } from '../screens/HeadlinesScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { TranslateScreen } from '../screens/TranslateScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

/**
 * 底部標籤導航器
 */
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          style={{ backgroundColor: '#fff3c4' }}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}

          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined 
              ? options.tabBarLabel 
              : options.title !== undefined 
              ? options.title 
              : route.name;

            return label as string;
          }}
          renderIcon={({ route, focused, color }) => {
              let iconName: string;
            
            switch (route.name) {
              case 'Headlines':
                  iconName = focused ? 'newspaper' : 'newspaper-variant-outline';
                break;
              case 'Bookmarks':
                  iconName = focused ? 'bookmark' : 'bookmark-outline';
                break;
              case 'Search':
                  iconName = 'magnify';
                break;
              case 'Translate':
                  iconName = 'translate';
                break;
              default:
                  iconName = 'circle';
            }

              return (
                <MaterialCommunityIcons
                    name={iconName}
                    size={26}
                    color={focused ? color : '#666'}
                />
            );
          }}
        />
      )}
    >
      <Tab.Screen
        name="Headlines"
        component={HeadlinesScreen}
        options={{
          tabBarLabel: '頭條',
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarLabel: '書籤',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '搜尋',
        }}
      />
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{
          tabBarLabel: '翻譯',
        }}
      />
    </Tab.Navigator>
  );
};
