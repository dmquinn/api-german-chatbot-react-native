import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const introSystemMessage =
    "You are a teacher of German Language.  To start with you will send a response in English introducing yourself and asking users which topic they would like to talk about, suggesting a list of 4 topics.  You will then respond to user prompts in German, and in the same message you will correct their mistakes and offer constructive feedback in English.  You will use the informal 'du' unless instructed otherwise";
  async function callStreamingResponse(userMessage) {
    if (isInitialized)
      setMessages((prev) => [...prev, { type: "user", text: userMessage }]);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are a teacher of German Language. You will respond to user prompts in German if they use the German language, and importantly, in your response message you will correct their mistakes and offer constructive feedback using the English language.  When using German, you will use the informal 'du' unless instructed otherwise",
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            model: "llama3-8b-8192",
            temperature: 1,
            top_p: 1,
            stop: null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiMessage = data.choices[0].message?.content;

        // Add AI response to the chat
        setMessages((prev) => [...prev, { type: "ai", text: aiMessage }]);
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("An error occurred while calling the API.");
      }
    } catch (error) {
      console.error("Error calling the API:", error);
      alert("Failed to connect to the server.");
    }
  }

  const handleSend = () => {
    if (input.trim()) {
      callStreamingResponse(input.trim());
      setInput("");
    } else {
      alert("Please enter a message.");
    }
  };
  const initMessage = () => {
    callStreamingResponse(introSystemMessage);
    setIsInitialized(true);
  };
  useEffect(() => {
    if (!isInitialized) initMessage();
  }, [isInitialized]);
  const renderMessage = ({ item }) => {
    const isUser = item.type === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  chatContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d1f7c4",
    marginLeft: "20%",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    marginRight: "20%",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginRight: 8,
  },
});
