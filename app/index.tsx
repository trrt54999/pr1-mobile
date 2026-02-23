import React, { useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const storyChapters = [
  {
    id: "1",
    title: "Епізод 1: Пробудження",
    description:
      "Головний герой прокидається у невідомій кімнаті, не пам'ятаючи свого минулого.",
    imageUrl: "https://picsum.photos/seed/10/100/100",
  },
  {
    id: "2",
    title: "Епізод 2: Таємнича зустріч",
    description:
      "На вулиці ви зустрічаєте незнайомку, яка знає ваше ім'я. Довіритися їй чи втекти?",
    imageUrl: "https://picsum.photos/seed/12/100/100",
  },
  {
    id: "3",
    title: "Епізод 3: Точка неповернення",
    description:
      "Знайдено старий щоденник. Прочитані рядки змушують переосмислити все.",
    imageUrl: "https://picsum.photos/seed/15/100/100",
  },
];

interface ChapterItemProps {
  title: string;
  description: string;
  imageUrl: string;
  isDarkMode: boolean;
}

const ChapterItem = ({
  title,
  description,
  imageUrl,
  isDarkMode,
}: ChapterItemProps) => {
  const themeStyles = isDarkMode ? styles.itemDark : styles.itemLight;
  const textTheme = isDarkMode ? styles.textDark : styles.textLight;

  return (
    <View style={[styles.itemContainer, themeStyles]}>
      <Image source={{ uri: imageUrl }} style={styles.itemImage} />
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, textTheme]}>{title}</Text>
        <Text style={[styles.itemDescription, textTheme]} numberOfLines={3}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState("chapters");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderScreen = () => {
    if (activeScreen === "chapters") {
      return (
        <FlatList
          data={storyChapters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChapterItem
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              isDarkMode={isDarkMode}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      );
    } else {
      return (
        <View style={styles.settingsContainer}>
          <Text
            style={[
              styles.settingsTitle,
              isDarkMode ? styles.textDark : styles.textLight,
            ]}
          >
            Налаштування новели
          </Text>
          <View
            style={[
              styles.settingRow,
              isDarkMode ? styles.itemDark : styles.itemLight,
            ]}
          >
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.textDark : styles.textLight,
              ]}
            >
              Зміна теми
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>
      );
    }
  };

  const backgroundStyle = isDarkMode ? styles.bgDark : styles.bgLight;

  return (
    <SafeAreaView style={[styles.mainContainer, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text
          style={[
            styles.headerText,
            isDarkMode ? styles.textDark : styles.textLight,
          ]}
        >
          Візуальна Новела
        </Text>
      </View>

      <View style={styles.screenContainer}>{renderScreen()}</View>

      <View
        style={[styles.navBar, isDarkMode ? styles.navDark : styles.navLight]}
      >
        <TouchableOpacity
          style={[
            styles.navButton,
            activeScreen === "chapters" && styles.activeNavButton,
          ]}
          onPress={() => setActiveScreen("chapters")}
        >
          <Text
            style={
              isDarkMode ? styles.navButtonLightText : styles.navButtonBlackText
            }
          >
            Епізоди
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeScreen === "settings" && styles.activeNavButton,
          ]}
          onPress={() => setActiveScreen("settings")}
        >
          <Text
            style={
              isDarkMode ? styles.navButtonLightText : styles.navButtonBlackText
            }
          >
            Налаштування
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: "#121212",
  },
  bgLight: {
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 15,
    paddingTop: 40,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  screenContainer: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemDark: {
    backgroundColor: "#1e1e1e",
  },
  itemLight: {
    backgroundColor: "#ffffff",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  textDark: {
    color: "#ffffff",
  },
  textLight: {
    color: "#000000",
  },
  settingsContainer: {
    padding: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  settingText: {
    fontSize: 18,
  },
  navBar: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    justifyContent: "space-around",
    borderTopWidth: 1,
  },
  navDark: {
    backgroundColor: "#1e1e1e",
    borderTopColor: "#333",
  },
  navLight: {
    backgroundColor: "#ffffff",
    borderTopColor: "#ddd",
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  activeNavButton: {
    backgroundColor: "#6200ee",
  },
  navButtonLightText: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  navButtonBlackText: {
    color: "#000000",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
