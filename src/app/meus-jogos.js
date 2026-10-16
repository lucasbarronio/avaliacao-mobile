import { Stack } from "expo-router";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("jogos.db");

// db.execSync(`DROP TABLE jogo`);

db.execSync(`
  CREATE TABLE IF NOT EXISTS jogo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL,
    plataforma VARCHAR(100),
    horas INTEGER
  );
`);

function selectFromDB() {
  return db.getAllSync("SELECT * FROM jogo ORDER BY id DESC");
}

function insertIntoDB(name, platform, playtime) {
  db.runSync("INSERT INTO jogo (nome, plataforma, horas) VALUES (?, ?, ?)", [name, platform, playtime]);
}

function updateFromDB(name, platform, playtime, id) {
  db.runSync("UPDATE jogo SET nome = ?, plataforma = ?, horas = ? WHERE id = ?", [name, platform, playtime, id]);
}

function deleteFromDB(id) {
  db.runSync("DELETE FROM jogo WHERE id = (?)", [id]);
}


export default function MeusJogos() {
  const [currentId, setCurrentId] = useState(0);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [playtime, setPlaytime] = useState("");
  const [list, setList] = useState([]);

  function refreshList() {
    setList(selectFromDB());
  }

  function cleanInputs() {
    setName("");
    setPlatform("");
    setPlaytime("");
  }

  function saveItemToList() {
    const playtimeValue = Number(playtime);

    if (name === "" || Number.isNaN(playtimeValue) || playtimeValue < 0) {
      return;
    }

    if (currentId === 0) {
      insertIntoDB(name, platform, playtimeValue);
    } else {
      updateFromDB(name, platform, playtimeValue, currentId);
    }

    setCurrentId(0);
    cleanInputs();
    refreshList();
  }

  function loadItemToEdit(item) {
    setCurrentId(item.id);
    setName(item.nome);
    setPlatform(item.plataforma);
    setPlaytime(String(item.horas));
  }

  function removeItemFromList(id) {
    deleteFromDB(id);
    setCurrentId(0);
    cleanInputs();
    refreshList();
  }

  useEffect(() => {
    refreshList();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Coleção" }} />

      <View style={styles.header}>
        <Text style={styles.title}>Meus Jogos</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.field}
          value={name}
          onChangeText={setName}
          placeholder="Nome"
          placeholderTextColor="#7b827a"
          autoFocus={true}
        />

        <View style={styles['sub-fields']}>
          <TextInput
            style={[styles.field, styles.subfield]}
            value={platform}
            onChangeText={setPlatform}
            placeholder="Plataforma"
            placeholderTextColor="#7b827a"
          />
          <TextInput
            style={[styles.field, styles.subfield]}
            value={playtime}
            onChangeText={setPlaytime}
            keyboardType="numeric"
            placeholder="Horas"
            placeholderTextColor="#7b827a"
          />
        </View>
      </View>

      <View style={styles["button-wrapper"]}>
        <Button title="Salvar" onPress={saveItemToList} color="#538532" />
      </View>

      <FlatList style={styles.list}
        data={list}
        renderItem={({ item }) => (
          <View style={[styles['item']]}>
            <View style={styles['item-content']}>
              <Text style={styles["item-text"]}>{item.nome}</Text>
              <Text style={styles["item-subtext"]}>{item.plataforma}</Text>
              <Text style={styles["item-subtext"]}>{Number(item.horas)}</Text>
            </View>
            <View style={styles.circle}>
              <Button title="E" onPress={() => { loadItemToEdit(item) }} color="#5f6d5d" />
            </View>
            <View style={styles.circle}>
              <Button title="X" onPress={() => { removeItemFromList(item.id) }} color="#853A32" />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  'debug': {
    borderColor: '#fe0000',
    borderWidth: 2,
  },
  'container': {
    backgroundColor: "#f5f4f1",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  'header': {
    marginBottom: 20,
  },
  'title': {
    color: "#1f1f1f",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  'subtitle': {
    color: "#68756b",
    fontSize: 14,
  },
  'form': {
    gap: 10,
  },
  'sub-fields': {
    flexDirection: "row",
    gap: 10
  },
  'field': {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dfe3dc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#1f1f1f",
  },
  'subfield': {
    flex: 1
  },
  'button-wrapper': {
    backgroundColor: "#6b8e4e",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  'list': {
    flex: 1,
    marginTop: 24,
  },
  'item': {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e1e4df",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10
  },
  'item-content': {
    alignItems: 'center',
    flexDirection: "row",
    flex: 1,
    gap: 20,
  },
  'item-text': {
    color: "#1f1f1f",
    fontSize: 16,
  },
  'item-subtext': {
    color: "#68756b",
    fontSize: 12,
  },
  'circle': {
    width: 32,
    height: 32,
    borderRadius: 50,
    overflow: "hidden",
  },
});