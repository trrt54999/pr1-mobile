import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
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
  Surface,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import useSWR from "swr";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Chapter {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Add: undefined;
  Details: { chapter: Chapter };
};

export type AuthStackParamList = {
  Login: undefined;
};

export type TabParamList = {
  List: undefined;
  Posts: undefined;
  Settings: undefined;
};

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

interface AppState {
  isAuthenticated: boolean;
  userName: string;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  setUserName: (name: string) => void;

  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  notifications: boolean;
  setNotifications: (val: boolean) => void;
  sessionOnly: boolean;
  setSessionOnly: (val: boolean) => void;

  chapters: Chapter[];
  addNewChapter: (title: string, desc: string) => void;
  deleteItem: (id: string) => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: "",
      isDarkMode: false,
      notifications: true,
      sessionOnly: false,
      chapters: initialData,

      login: async (user, pass) => {
        try {
          const res = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: user,
              password: pass,
              expiresInMins: 60,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            set({
              userName: `${data.firstName} ${data.lastName}`,
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      logout: () => set({ isAuthenticated: false, userName: "" }),
      setUserName: (userName) => set({ userName }),

      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
      setNotifications: (notifications) => set({ notifications }),
      setSessionOnly: (sessionOnly) => set({ sessionOnly }),

      addNewChapter: (title, desc) =>
        set((state) => ({
          chapters: [
            {
              id: Date.now().toString(),
              title: title,
              description: desc,
              imageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
            },
            ...state.chapters,
          ],
        })),
      deleteItem: (id) =>
        set((state) => ({
          chapters: state.chapters.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        if (state.sessionOnly) {
          const { chapters, ...restOfState } = state;
          return restOfState;
        }
        return state;
      },
    },
  ),
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function LoginScreen() {
  const { login, isDarkMode } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const handleNext = () => {
    setErrorMsg("");
    if (username.trim().length > 0) {
      setStep(2);
    } else {
      setErrorMsg("Введіть логін.");
    }
  };

  const handleLogin = async () => {
    setErrorMsg("");
    const success = await login(username.trim(), password);
    if (!success) {
      setErrorMsg("Неправильний логін або пароль.");
    }
  };

  return (
    <View
      style={[
        styles.loginBackground,
        { backgroundColor: isDarkMode ? "#0a192e" : "#54a0ff" },
      ]}
    >
      <Surface
        style={[
          styles.loginCard,
          {
            backgroundColor: isDarkMode
              ? "rgba(40, 40, 40, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
            borderColor: isDarkMode
              ? "rgba(60, 60, 60, 0.3)"
              : "rgba(230, 230, 230, 0.3)",
          },
        ]}
        elevation={2}
      >
        <Text variant="headlineSmall" style={styles.loginTitle}>
          Visual Novel
        </Text>
        {step === 1 ? (
          <>
            <Text variant="bodyLarge" style={styles.loginSubtitle}>
              Увійдіть у свій обліковий запис.
            </Text>
            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Логін"
              mode="outlined"
              style={styles.loginInput}
              autoCapitalize="none"
              activeOutlineColor="#4834d4"
              outlineColor="#e0e0e0"
              theme={{ roundness: 15 }}
            />
            <View style={styles.loginHelpText}>
              <Text variant="bodyLarge">Немає облікового запису? </Text>
              <TouchableOpacity>
                <Text variant="bodyLarge" style={styles.linkText}>
                  Створіть його!
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.loginButtonRow}>
              <Button
                mode="contained"
                onPress={handleNext}
                buttonColor="#4834d4"
                textColor="white"
                style={styles.loginButton}
                contentStyle={{ height: 50 }}
              >
                Далі
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.activeUserBadge}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => setStep(1)}
                style={styles.backButton}
              />
              <Text variant="bodyLarge" style={styles.activeUserText}>
                {username}
              </Text>
            </View>
            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Пароль"
              mode="outlined"
              secureTextEntry
              style={styles.loginInput}
              activeOutlineColor="#4834d4"
              outlineColor="#e0e0e0"
              theme={{ roundness: 15 }}
            />
            <TouchableOpacity style={{ marginTop: 10 }}>
              <Text variant="bodyLarge" style={styles.linkText}>
                Забули пароль?
              </Text>
            </TouchableOpacity>
            <View style={styles.loginButtonRow}>
              <Button
                mode="contained"
                onPress={handleLogin}
                buttonColor="#4834d4"
                textColor="white"
                style={styles.loginButton}
                contentStyle={{ height: 50 }}
              >
                Увійти
              </Button>
            </View>
          </>
        )}
      </Surface>
    </View>
  );
}

function ListScreen({ navigation }: any) {
  const { chapters, deleteItem, isDarkMode } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<Chapter | null>(null);

  return (
    <View style={styles.flex}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              {
                borderRadius: 20,
                backgroundColor: isDarkMode
                  ? "rgba(32, 32, 32, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                borderColor: isDarkMode
                  ? "rgba(60, 60, 60, 0.3)"
                  : "rgba(230, 230, 230, 0.3)",
              },
            ]}
            onPress={() => setSelectedItem(item)}
          >
            <Card.Cover
              source={{ uri: item.imageUrl }}
              style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            />
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

      <Portal>
        <Modal
          visible={!!selectedItem}
          onDismiss={() => setSelectedItem(null)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff" },
          ]}
        >
          {selectedItem && (
            <>
              <Text variant="headlineSmall" style={{ marginBottom: 10 }}>
                {selectedItem.title}
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
                {selectedItem.description}
              </Text>
              <Button
                mode="contained"
                buttonColor="#4834d4"
                onPress={() => {
                  const item = selectedItem;
                  setSelectedItem(null);
                  navigation.navigate("Details", { chapter: item });
                }}
              >
                Детальніше
              </Button>
            </>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("Add")}
        theme={{ roundness: 20 }}
      />
    </View>
  );
}

function PostsScreen() {
  const { isDarkMode } = useAppStore();
  const { data, error } = useSWR("https://dummyjson.com/posts", fetcher);

  if (error) {
    return (
      <View style={[styles.flex, styles.centerElements]}>
        <Text>Помилка завантаження даних</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.flex, styles.centerElements]}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={data.posts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              {
                borderRadius: 15,
                backgroundColor: isDarkMode
                  ? "rgba(32, 32, 32, 0.85)"
                  : "#ffffff",
              },
            ]}
          >
            <Card.Title title={item.title} titleNumberOfLines={2} />
            <Card.Content>
              <Text variant="bodyMedium" numberOfLines={3}>
                {item.body}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

function SettingsScreen() {
  const {
    userName,
    setUserName,
    isDarkMode,
    setIsDarkMode,
    notifications,
    setNotifications,
    sessionOnly,
    setSessionOnly,
    logout,
  } = useAppStore();

  return (
    <View style={styles.flex}>
      <View style={styles.padding}>
        <TextInput
          label="Ім'я гравця"
          value={userName}
          onChangeText={setUserName}
          mode="flat"
          style={styles.input}
          theme={{ roundness: 15 }}
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
        <View style={styles.row}>
          <Text variant="bodyLarge" style={{ flex: 1, paddingRight: 10 }}>
            Режим поточної сесії (Епізоди не зберігатимуться локально)
          </Text>
          <Switch value={sessionOnly} onValueChange={setSessionOnly} />
        </View>
      </View>
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={logout}
          buttonColor="#ff4757"
          textColor="white"
          style={{ borderRadius: 25 }}
          contentStyle={{ height: 50 }}
        >
          Вийти з облікового запису
        </Button>
      </View>
    </View>
  );
}

function AddScreen({ navigation }: any) {
  const { addNewChapter } = useAppStore();
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleSave = () => {
    if (newTitle && newDesc) {
      addNewChapter(newTitle, newDesc);
      navigation.goBack();
    }
  };

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
        theme={{ roundness: 15 }}
      />
      <TextInput
        label="Опис"
        value={newDesc}
        onChangeText={setNewDesc}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
        theme={{ roundness: 15 }}
      />
      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        theme={{ roundness: 25 }}
        contentStyle={{ height: 50 }}
      >
        Зберегти
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        theme={{ roundness: 25 }}
        contentStyle={{ height: 50 }}
      >
        Скасувати
      </Button>
    </View>
  );
}

function DetailsScreen({ route }: any) {
  const { chapter } = route.params;
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.padding}>
      <Text variant="headlineMedium">{chapter.title}</Text>
      <Divider style={styles.divider} />
      <Text variant="bodyLarge" style={styles.detailText}>
        {chapter.description}
      </Text>
      <Text variant="labelMedium" style={styles.idText}>
        ID епізоду: {chapter.id}
      </Text>

      <Button mode="outlined" onPress={pickImage} style={styles.button}>
        Прикріпити зображення
      </Button>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.attachedImage} />
          <Button
            mode="text"
            onPress={() => setImageUri(null)}
            textColor="#ff4757"
          >
            Відкріпити
          </Button>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  const { userName, isDarkMode } = useAppStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "circle";
          if (route.name === "List") iconName = "book";
          else if (route.name === "Posts") iconName = "file-document";
          else if (route.name === "Settings") iconName = "cog";

          return (
            <IconButton
              icon={iconName}
              iconColor={color}
              size={size}
              style={{ margin: 0 }}
            />
          );
        },
        tabBarActiveTintColor: "#4834d4",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: isDarkMode ? "#0a192e" : "#f5f6fa",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDarkMode ? "#ffffff" : "#2f3640",
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: isDarkMode
            ? "rgba(40, 40, 40, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
          borderRadius: 25,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{ title: userName || "Епізоди" }}
      />
      <Tab.Screen
        name="Posts"
        component={PostsScreen}
        options={{ title: "Пости" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Налаштування" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isDarkMode } = useAppStore();

  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const navTheme = isDarkMode ? DarkNavTheme : LightNavTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationIndependentTree>
        <NavigationContainer theme={navTheme}>
          {isAuthenticated ? (
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: isDarkMode ? "#0a192e" : "#f5f6fa",
                },
                headerTintColor: isDarkMode ? "#ffffff" : "#2f3640",
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Add"
                component={AddScreen}
                options={{ title: "Додати епізод", presentation: "modal" }}
              />
              <Stack.Screen
                name="Details"
                component={DetailsScreen}
                options={{
                  title: "Деталі",
                  headerBackButtonDisplayMode: "minimal",
                }}
              >
                <Stack.Screen
                  name="MainTabs"
                  component={MainTabs}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Add"
                  component={AddScreen}
                  options={{
                    title: "Додати епізод",
                    presentation: "modal",
                  }}
                />
                <Stack.Screen
                  name="Details"
                  component={DetailsScreen}
                  options={{
                    title: "Деталі",
                    headerBackButtonDisplayMode: "minimal", 
                  }}
                />
              </Stack.Navigator>
            ) : (
              <AuthStack.Navigator
                screenOptions={{ headerShown: false, animation: "fade" }}
              >
                <AuthStack.Screen name="Login" component={LoginScreen} />
              </AuthStack.Navigator>
            )}
          </NavigationContainer>
        </NavigationIndependentTree>
      </PaperProvider>
    </AppStateContext.Provider>
  );
}

const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4834d4",
    background: "#ffffff",
    card: "#ffffff",
    text: "#000000",
    border: "#cccccc",
    notification: "#f50057",
  },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#00a4ef",
    background: "#121212",
    card: "#121212",
    text: "#ffffff",
    border: "#272727",
    notification: "#ff80ab",
  },
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  card: { marginBottom: 16, borderRadius: 20, borderWidth: 1 },
  padding: { padding: 20 },
  title: { marginBottom: 20 },
  input: { marginBottom: 12, borderRadius: 15 },
  button: { marginTop: 10, borderRadius: 25 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: { marginVertical: 10 },
  detailText: { marginVertical: 15, lineHeight: 24 },
  idText: { marginBottom: 15, opacity: 0.5 },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 90,
    borderRadius: 20,
  },
  loginBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginCard: {
    width: "100%",
    maxWidth: 440,
    padding: 32,
    borderRadius: 30,
    borderWidth: 1,
  },
  loginTitle: {
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 32,
    textAlign: "center",
  },
  loginSubtitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  loginInput: {
    backgroundColor: "transparent",
    marginBottom: 16,
    fontSize: 16,
  },
  loginHelpText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  linkText: { color: "#4834d4" },
  loginButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginButton: { borderRadius: 25, width: "100%" },
  activeUserBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginLeft: -10,
  },
  backButton: { margin: 0 },
  activeUserText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#e81123",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  logoutContainer: {
    padding: 20,
    paddingBottom: 110,
    justifyContent: "flex-end",
  },
  centerElements: { justifyContent: "center", alignItems: "center" },
  modalContent: { padding: 24, margin: 20, borderRadius: 15 },
  imageContainer: { marginTop: 20, alignItems: "center", width: "100%" },
  attachedImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
});
