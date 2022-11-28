# discordbot_base
discord.jsを使ったbotを作成する基盤となるリポジトリです

# how to use

使用する際は、このリポジトリをforkして使用してください。

## src/config

`config.jsonc`に設定を記述します。
また、`src/config/Implement/config.ts`の`configTypeObject`に型情報を記述します。

## src/Main

メインのコードはここに記述します。

コードは機能ごとにディレクトリを作成し、その中でevent毎に再度ディレクトリを作成することを想定しています。

例：

```
src/Main/Test/
 ├ メインコード.ts
 ├ interaction/
 │   └  onInteractionCreate実行時に処理するコード.ts
 └ message/
     └  onMessageCreate実行時に処理するコード.ts
```

`interaction/`や`message/`といった指定のディレクトリ下に置かれたコードは、起動時に自動的に読み込まれ、各イベントが発生すると読み込みます。
それぞれのファイルは、名称が`EventClass`で終わる指定のクラスのインスタンスをdefault exportする必要があります。

各`EventClass`は`src/Util/MainClass/`下にあり、インスタンス時の引数は、
各ファイルの上部にある、名称が`EventClassArgsInterface`で終わるInterfaceを確認してください。

以下に、各ファイルの役割を記述します。
また、`src/Main/Test/`にサンプルコードを記述していますので、参考にしてください。

### interaction

`Events.InteractionCreate`イベントが発生した際に実行されるコードを記述します。

対応するEventClassは、以下の通りです。

- `AutoCompleteInteractionCreateEventClass` : `autoComplete`のinteractionを処理するクラス
- `ButtonInteractionCreateEventClass` : `button`のinteractionを処理するクラス
- `ChatInputInteractionCreateEventClass` : `chatInput`のinteractionを処理するクラス
- `SelectMenuInteractionCreateEventClass` : `selectMenu`のinteractionを処理するクラス
- `ModalSubmitInteractionCreateEventClass` : `modalSubmit`のinteractionを処理するクラス

### message

以下のイベントが発生した際に実行されるコードを記述します。また、それぞれのイベントに対応するEventClassは、以下の通りです。

- `Events.MessageCreate` : `MessageCreateEventClass`
- `Events.MessageDelete` : `MessageDeleteEventClass`
- `Events.MessageUpdate` : `MessageUpdateEventClass`

### reaction

以下のイベントが発生した際に実行されるコードを記述します。また、それぞれのイベントに対応するEventClassは、以下の通りです。

- `Events.MessageReactionAdd` : `MessageReactionAddEventClass`
- `Events.MessageReactionRemove` : `MessageReactionRemoveEventClass`

### voice

`Events.VoiceStateUpdate`イベントが発生した際に実行されるコードを記述します。

対応するEventClassは、`VoiceStateUpdateEventClass`です。

### cron

`cron`によって定期的に実行されるコードを記述します。

`CronEventClass`をインスタンス化することで、定期実行することができます。

インスタンス時の引数で、実行頻度を指定します。

## src/Error

各種エラーが発生する場合、`CustomBaseError`クラスを拡張したエラークラスを用います。
その場合、必要なエラークラスがない場合はここに追加します。

## src/Util/DatabaseHandle/DiscordUserData.ts

botがデータベースなどで管理するユーザーデータを扱うクラス。
botの用途に応じて任意に拡張します。

## src/Util/Logger.ts

ログ出力クラス。
botの用途に応じて任意に拡張します。
