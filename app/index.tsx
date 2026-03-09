import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  MD3DarkTheme,
  MD3LightTheme,
  Modal,
  Provider as PaperProvider,
  Portal,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";

interface Chapter {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const initialData: Chapter[] = [
  {
    id: "1",
    title: "Епізод 1: Пробудження",
    description: "Герой прокидається у невідомій кімнаті без пам'яті.",
    imageUrl: "https://picsum.photos/seed/1/200/200",
  },
  {
    id: "2",
    title: "Епізод 2: Зустріч",
    description: "На вулиці ви зустрічаєте незнайомку, яка знає ваше ім'я.",
    imageUrl: "https://picsum.photos/seed/2/200/200",
  },
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<"list" | "settings" | "add">(
    "list",
  );
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>(initialData);
  const [userName, setUserName] = useState("Мандрівник");
  const [notifications, setNotifications] = useState(true);

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [navVisible, setNavVisible] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

  const addNewItem = () => {
    if (newTitle && newDesc) {
      const newItem: Chapter = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDesc,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
      };
      setChapters([newItem, ...chapters]);
      setNewTitle("");
      setNewDesc("");
      setActiveScreen("list");
    }
  };

  const deleteItem = (id: string) => {
    setChapters(chapters.filter((item) => item.id !== id));
  };

  const renderScreen = () => {
    if (activeScreen === "list") {
      return (
        <View style={styles.flex}>
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card
                style={styles.card}
                onPress={() => setSelectedChapter(item)}
              >
                <Card.Cover source={{ uri: item.imageUrl }} />
                <Card.Title
                  title={item.title}
                  subtitle={item.description}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="delete"
                      iconColor="red"
                      onPress={() => deleteItem(item.id)}
                    />
                  )}
                />
              </Card>
            )}
          />
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setActiveScreen("add")}
          />
        </View>
      );
    }

    if (activeScreen === "add") {
      return (
        <View style={styles.padding}>
          <Text variant="headlineMedium" style={styles.title}>
            Новий епізод
          </Text>
          <TextInput
            label="Назва"
            value={newTitle}
            onChangeText={setNewTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Опис"
            value={newDesc}
            onChangeText={setNewDesc}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <Button mode="contained" onPress={addNewItem} style={styles.button}>
            Зберегти
          </Button>
          <Button mode="text" onPress={() => setActiveScreen("list")}>
            Скасувати
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.padding}>
        <Text variant="headlineMedium" style={styles.title}>
          Налаштування
        </Text>
        <TextInput
          label="Ім'я гравця"
          value={userName}
          onChangeText={setUserName}
          mode="flat"
          style={styles.input}
        />
        <Divider style={styles.divider} />
        <View style={styles.row}>
          <Text variant="bodyLarge">Темна тема</Text>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
        </View>
        <View style={styles.row}>
          <Text variant="bodyLarge">Сповіщення</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>
    );
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

        <View style={styles.header}>
          <Text variant="titleLarge">{userName}</Text>
          <Button mode="outlined" onPress={() => setNavVisible(true)}>
            Меню
          </Button>
        </View>

        {renderScreen()}

        <Portal>
          <Modal
            visible={navVisible}
            onDismiss={() => setNavVisible(false)}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Навігація
            </Text>
            <Button
              icon="book"
              onPress={() => {
                setActiveScreen("list");
                setNavVisible(false);
              }}
            >
              Епізоди
            </Button>
            <Button
              icon="plus"
              onPress={() => {
                setActiveScreen("add");
                setNavVisible(false);
              }}
            >
              Додати новий
            </Button>
            <Button
              icon="cog"
              onPress={() => {
                setActiveScreen("settings");
                setNavVisible(false);
              }}
            >
              Налаштування
            </Button>
          </Modal>

          <Modal
            visible={!!selectedChapter}
            onDismiss={() => setSelectedChapter(null)}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {selectedChapter && (
              <View>
                <Text variant="headlineSmall">{selectedChapter.title}</Text>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {selectedChapter.description}
                </Text>
                <Text variant="labelSmall" style={styles.idText}>
                  ID: {selectedChapter.id}
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setSelectedChapter(null)}
                >
                  Закрити
                </Button>
              </View>
            )}
          </Modal>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  padding: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    marginVertical: 10,
  },
  modal: {
    padding: 30,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 15,
  },
  detailText: {
    marginVertical: 15,
    lineHeight: 22,
  },
  idText: {
    marginBottom: 15,
    opacity: 0.5,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
