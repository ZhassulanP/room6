// Keep one complete set of interface strings per supported language.
export const languages = { ru: 'Русский', en: 'English', kk: 'Қазақша' };
export const messages = {
  ru: {
    language: 'Язык интерфейса', home: 'Room6 — главная', rules: 'Правила', close: 'Закрыть', loading: 'Загрузка…',
    darkTheme: 'Тёмная тема', lightTheme: 'Включить светлую тему', enableDark: 'Включить тёмную тему',
    heroTitle: 'Объясняй слова.', heroAccent: 'Обходи ловушки.', heroDescription: 'От 3 игроков. Один объясняет, второй угадывает, остальные ставят слова-мины.',
    entryTabs: 'Вход в игру', create: 'Создать комнату', join: 'Присоединиться', name: 'Твой ник', namePlaceholder: 'Имя или ник',
    capacity: 'Мест в комнате', unlimited: 'Без ограничений', capacityHelp: 'От 3 игроков. Пустое поле — без лимита.', code: 'Код комнаты', codePlaceholder: '6 цифр, например 012345',
    enter: 'Войти', createAction: 'Создать комнату', recovery: 'Для возвращения используй прежний код и ник.',
    explain: 'Объясняй', mine: 'Минируй', guess: 'Угадывай', explainHelp: 'Помоги напарнику угадать слово, не называя его.', mineHelp: 'Загадай слово, которое может прозвучать в объяснении.', guessHelp: 'Найди ответ и избегай слов-мин.',
    lobby: 'Лобби', gameOver: 'Игра завершена', waitingPlayers: 'Ждём игроков', turn: 'Ход {current} / {total}', invite: 'Пригласить', players: 'Игроки', leave: 'Выйти',
    reconnecting: 'Связь прервалась. Переподключаемся…', player: 'Игрок', you: 'ты', host: 'ведущий', readyStatus: 'Готов', inRoom: 'В комнате', explaining: 'Объясняет', guessing: 'Угадывает', miner: 'Минёр', explainer: 'Объясняющий', guesser: 'Угадывающий', roleCounts: 'Объяснял: {explained} · Угадывал: {guessed}', removePlayer: 'Удалить игрока {name}',
    leaveTitle: 'Выйти из комнаты?', leaveLobby: 'Ты сможешь вернуться по тому же коду и нику.', leaveGame: 'Очки сохранятся. При необходимости текущий ход начнётся заново или игра встанет на паузу.',
    removeTitle: 'Удалить игрока?', removeMessage: '{name} выйдет из комнаты. Очки сохранятся.', remove: 'Удалить',
    lobbyTitle: 'Вернуться в лобби?', lobbyMessage: 'Текущая партия завершится. Можно будет изменить настройки и начать заново.', toLobby: 'В лобби',
    skipTitle: 'Пропустить ход?', skipMessage: 'За этот ход никто не получит очков.', skip: 'Пропустить ход', claimTitle: 'Мина прозвучала?', claimMessage: 'Сообщить о слове «{word}»? Ведущий проверит подрыв.', report: 'Сообщить', cancel: 'Отмена',
    settings: 'Настройки', duration: 'На объяснение', untimed: 'Без таймера', cycles: 'Кругов', miningSettings: 'Мины и словарь', miningTime: 'На установку мин', sixtySeconds: '60 секунд',
    wordLanguage: 'Язык слов', defaultWords: 'Встроенный словарь: {count} слов', customWords: 'Свои слова', customPlaceholder: 'По одному слову на строку или через запятую', customHelp: 'До 1000 слов. Максимум 60 символов в слове.', save: 'Сохранить', saved: 'Настройки сохранены.',
    waitingStart: 'Ждём старта', waitingHost: 'Ведущий: {name}. Для старта нужно минимум 3 игрока.', playerCount: 'Игроков: {count}', needThree: 'Для старта нужно минимум 3 игрока.', canStart: 'Можно начинать.', ready: 'Я готов', start: 'Начать игру',
    pause: 'Игра на паузе', pauseHelp: 'Нужны ещё игроки: {count}. Когда соберётся трое, игра продолжится автоматически. Очки сохраняются.',
    secret: 'Секретное слово', partnerKnows: 'Слово знает твой напарник', listenTo: 'Слушай: {name} объясняет слово.', keepSecret: 'Не показывай экран угадывающему.', redraw: 'Сменить слово', redrawHelp: 'Можно сменить до первой мины. Таймер начнётся заново.',
    sharedMines: 'Мины игроков', minersOnly: 'Видны только минёрам.', choosingMine: 'Выбирает…', noMine: 'Без мины', miningTitle: 'Поставь слово-мину', miningWaiting: 'Минёры устанавливают мины', miningHint: 'Какое слово может прозвучать в объяснении или ответе?', miningWaitHint: 'Объяснение начнётся после таймера.',
    yourMine: 'Твоя мина', replaceHint: 'Можно заменить до конца таймера.', minePlaceholder: 'Слово или фраза', mineInput: 'Слово-мина', replaceMine: 'Заменить мину', placeMine: 'Установить мину', mineLimit: 'До 20 символов, включая пробелы.', mineCount: 'Установлено мин: {placed} / {total}',
    explainTitle: 'Объясни слово', guessTitle: 'Угадай слово', listenTitle: 'Следи за своей миной', activePair: '{explainer} объясняет · {guesser} угадывает', guessPlaceholder: 'Твой ответ', answer: 'Ответ', submitGuess: 'Проверить', wrongGuess: '«{word}» — пока мимо.', reportHint: 'Если слово прозвучало, сообщи ведущему.', claim: 'Моя мина сработала', noMineHint: 'В этом ходу у тебя нет мины. В следующем сможешь поставить свою.', guessedAloud: 'Слово угадали вслух',
    claimHeading: 'Заявка на подрыв', claimBy: '{name} сообщает о слове:', hostChecking: 'Ведущий проверяет подрыв.', acceptClaim: 'Подтвердить', rejectClaim: 'Отклонить', waitDecision: 'Ждём решения ведущего.',
    resultGuessed: 'Слово угадали!', resultExploded: 'Мина сработала!', resultTimeout: 'Время вышло', resultSkipped: 'Ход пропущен', pointsAwarded: '{names} — по +1 очку', noPoints: 'В этом ходу без очков.', roundMines: 'Мины этого хода', noRoundMines: 'Мин не было.', next: 'Следующий ход', gameResults: 'Итоги игры', waitNext: 'Ждём следующего хода.', role: 'Твоя роль: {role}', timeLeft: 'Время на установку мин', checking: 'Проверка',
    scoreboard: 'Таблица очков', place: 'Место', score: 'Очки', winner: 'Победитель: {name}', tied: 'Ничья', tiedNames: 'Первое место: {names}', playAgain: 'Играть ещё', waitNewGame: 'Ведущий может начать новую игру в лобби.',
    copied: 'Ссылка скопирована.', inviteTitle: 'Пригласить друзей', inviteHelp: 'Отправь ссылку друзьям. Для входа нужен только ник.', inviteLink: 'Ссылка на комнату', done: 'Готово', welcomeBack: 'С возвращением! Твои очки сохранены.',
    serverUnavailable: 'Сервер недоступен. Проверь подключение.', requestFailed: 'Не удалось выполнить запрос.',
    rulesTitle: 'Как играть', rulesRoles: 'Роли', rulesRolesText: 'Минимум 3 игрока. Один объясняет, другой угадывает. Остальные — минёры. Общайтесь за одним столом или в голосовом звонке.',
    rulesMines: 'Слова-мины', rulesMinesText: 'Все, кроме угадывающего, видят секретное слово. У минёров 60 секунд, чтобы установить слово или фразу до 20 символов. До конца таймера мину можно заменить. Минёры видят мины друг друга, объясняющий и угадывающий — нет. Объясняющий может сменить слово до первой установленной мины.',
    rulesExplain: 'Объяснение и ответ', rulesExplainText: 'После таймера объясняйте без ограничения времени. Нельзя называть само слово, однокоренные слова и перевод. Ответ можно ввести или назвать вслух. Регистр и разница ё/е не учитываются.',
    rulesClaim: 'Подрыв', rulesClaimText: 'Прозвучала мина? Её автор сообщает ведущему, тот подтверждает или отклоняет подрыв. Формы слова засчитывайте по договорённости.',
    rulesScore: 'Очки и роли', rulesScoreText: 'Угадали — объясняющий и угадывающий получают по 1 очку. Подрыв — по 1 очку авторам сработавшего слова. После хода видна таблица очков. За круг каждый объясняет и угадывает. Если осталось меньше трёх игроков, игра ждёт новых участников.'
  },
  en: {
    language: 'Interface language', home: 'Room6 — home', rules: 'Rules', close: 'Close', loading: 'Loading…',
    darkTheme: 'Dark theme', lightTheme: 'Switch to light theme', enableDark: 'Switch to dark theme',
    heroTitle: 'Explain the word.', heroAccent: 'Dodge the traps.', heroDescription: '3 or more players. One explains, one guesses, everyone else plants word mines.',
    entryTabs: 'Enter the game', create: 'Create room', join: 'Join room', name: 'Your nickname', namePlaceholder: 'Name or nickname',
    capacity: 'Room capacity', unlimited: 'Unlimited', capacityHelp: 'At least 3. Leave blank for no limit.', code: 'Room code', codePlaceholder: '6 digits, e.g. 012345',
    enter: 'Join', createAction: 'Create room', recovery: 'Use your previous code and nickname to return.',
    explain: 'Explain', mine: 'Plant mines', guess: 'Guess', explainHelp: 'Help your partner guess without saying the word.', mineHelp: 'Pick a word that might come up in the explanation.', guessHelp: 'Find the answer while avoiding word mines.',
    lobby: 'Lobby', gameOver: 'Game over', waitingPlayers: 'Waiting for players', turn: 'Turn {current} / {total}', invite: 'Invite', players: 'Players', leave: 'Leave',
    reconnecting: 'Connection lost. Reconnecting…', player: 'Player', you: 'you', host: 'host', readyStatus: 'Ready', inRoom: 'In the room', explaining: 'Explaining', guessing: 'Guessing', miner: 'Miner', explainer: 'Explainer', guesser: 'Guesser', roleCounts: 'Explained: {explained} · Guessed: {guessed}', removePlayer: 'Remove player {name}',
    leaveTitle: 'Leave the room?', leaveLobby: 'You can return using the same code and nickname.', leaveGame: 'Your score will be saved. The current turn may restart, or the game may pause.',
    removeTitle: 'Remove player?', removeMessage: '{name} will leave the room. Their score will be saved.', remove: 'Remove',
    lobbyTitle: 'Return to lobby?', lobbyMessage: 'This game will end. You can change settings and start again.', toLobby: 'To lobby',
    skipTitle: 'Skip this turn?', skipMessage: 'No points will be awarded for this turn.', skip: 'Skip turn', claimTitle: 'Was your mine spoken?', claimMessage: 'Report the word “{word}”? The host will check.', report: 'Report', cancel: 'Cancel',
    settings: 'Settings', duration: 'Explanation time', untimed: 'No time limit', cycles: 'Cycles', miningSettings: 'Mines and dictionary', miningTime: 'Time to plant mines', sixtySeconds: '60 seconds',
    wordLanguage: 'Word language', defaultWords: 'Built-in dictionary: {count} words', customWords: 'Custom words', customPlaceholder: 'One word per line or separated by commas', customHelp: 'Up to 1,000 words, each up to 60 characters.', save: 'Save', saved: 'Settings saved.',
    waitingStart: 'Waiting to start', waitingHost: 'Host: {name}. At least 3 players are needed.', playerCount: 'Players: {count}', needThree: 'At least 3 players are needed.', canStart: 'Ready to start.', ready: 'I’m ready', start: 'Start game',
    pause: 'Game paused', pauseHelp: 'More players needed: {count}. Play resumes automatically with 3 players. Scores are saved.',
    secret: 'Secret word', partnerKnows: 'Your partner knows the word', listenTo: 'Listen to {name} explain the word.', keepSecret: 'Keep this screen hidden from the guesser.', redraw: 'Change word', redrawHelp: 'Available until the first mine is planted. The timer restarts.',
    sharedMines: 'Player mines', minersOnly: 'Visible to miners only.', choosingMine: 'Choosing…', noMine: 'No mine', miningTitle: 'Plant a word mine', miningWaiting: 'Miners are planting traps', miningHint: 'Which word might come up in the explanation or answer?', miningWaitHint: 'Explaining starts when the timer ends.',
    yourMine: 'Your mine', replaceHint: 'You can replace it before the timer ends.', minePlaceholder: 'Word or phrase', mineInput: 'Word mine', replaceMine: 'Replace mine', placeMine: 'Plant mine', mineLimit: 'Up to 20 characters, including spaces.', mineCount: 'Mines planted: {placed} / {total}',
    explainTitle: 'Explain the word', guessTitle: 'Guess the word', listenTitle: 'Listen for your mine', activePair: '{explainer} explains · {guesser} guesses', guessPlaceholder: 'Your answer', answer: 'Answer', submitGuess: 'Check', wrongGuess: '“{word}” — not yet.', reportHint: 'If the word is spoken, report it to the host.', claim: 'My mine went off', noMineHint: 'You have no mine this turn. You can plant one next turn.', guessedAloud: 'The word was guessed aloud',
    claimHeading: 'Mine reported', claimBy: '{name} reports the word:', hostChecking: 'The host is checking.', acceptClaim: 'Confirm', rejectClaim: 'Reject', waitDecision: 'Waiting for the host’s decision.',
    resultGuessed: 'Word guessed!', resultExploded: 'Mine triggered!', resultTimeout: 'Time’s up', resultSkipped: 'Turn skipped', pointsAwarded: '{names} — +1 point each', noPoints: 'No points this turn.', roundMines: 'Mines this turn', noRoundMines: 'No mines were planted.', next: 'Next turn', gameResults: 'Game results', waitNext: 'Waiting for the next turn.', role: 'Your role: {role}', timeLeft: 'Time left to plant mines', checking: 'Checking',
    scoreboard: 'Scoreboard', place: 'Rank', score: 'Points', winner: 'Winner: {name}', tied: 'It’s a tie', tiedNames: 'First place: {names}', playAgain: 'Play again', waitNewGame: 'The host can start a new game in the lobby.',
    copied: 'Link copied.', inviteTitle: 'Invite friends', inviteHelp: 'Share the link. Friends only need a nickname.', inviteLink: 'Room link', done: 'Done', welcomeBack: 'Welcome back! Your score is saved.',
    serverUnavailable: 'Server unavailable. Check your connection.', requestFailed: 'The request failed.',
    rulesTitle: 'How to play', rulesRoles: 'Roles', rulesRolesText: 'At least 3 players. One explains, one guesses, everyone else plants mines. Talk in person or over a voice call.',
    rulesMines: 'Word mines', rulesMinesText: 'Everyone except the guesser sees the secret word. Miners have 60 seconds to plant a word or phrase of up to 20 characters. Mines can be replaced until the timer ends. Miners see each other’s mines; the explainer and guesser do not. The explainer can change the secret word before the first mine is planted.',
    rulesExplain: 'Explain and guess', rulesExplainText: 'After the timer, explain without a time limit. Do not say the word, related word forms, or a translation. Answers may be typed or spoken aloud. Letter case and the Russian letters ё/е are treated as equivalent.',
    rulesClaim: 'Triggering a mine', rulesClaimText: 'If a mine is spoken, its author reports it. The host confirms or rejects the claim. Agree as a group whether other forms of the word count.',
    rulesScore: 'Scores and rotation', rulesScoreText: 'Correct guess: the explainer and guesser each get 1 point. Triggered mine: each author of that mine gets 1 point. Scores appear after each turn. Everyone explains and guesses once per cycle. Play pauses if fewer than 3 players remain.'
  },
  kk: {
    language: 'Интерфейс тілі', home: 'Room6 — басты бет', rules: 'Ережелер', close: 'Жабу', loading: 'Жүктелуде…',
    darkTheme: 'Қараңғы тақырып', lightTheme: 'Жарық тақырыпқа ауысу', enableDark: 'Қараңғы тақырыпқа ауысу',
    heroTitle: 'Сөзді түсіндір.', heroAccent: 'Тұзаққа түспе.', heroDescription: 'Кемінде 3 ойыншы. Бірі түсіндіреді, екіншісі табады, қалғандары сөз-мина қояды.',
    entryTabs: 'Ойынға кіру', create: 'Бөлме ашу', join: 'Қосылу', name: 'Лақап атың', namePlaceholder: 'Атың немесе лақап атың',
    capacity: 'Бөлмедегі орын саны', unlimited: 'Шектеусіз', capacityHelp: 'Кемінде 3 ойыншы. Бос қалдырсаң — шектеусіз.', code: 'Бөлме коды', codePlaceholder: '6 цифр, мысалы 012345',
    enter: 'Кіру', createAction: 'Бөлме ашу', recovery: 'Қайта кіру үшін бұрынғы код пен лақап атыңды қолдан.',
    explain: 'Түсіндір', mine: 'Мина қой', guess: 'Сөзді тап', explainHelp: 'Сөздің өзін атамай, серігіңе оны табуға көмектес.', mineHelp: 'Түсіндіру кезінде айтылуы мүмкін сөзді таңда.', guessHelp: 'Сөз-миналардан сақтанып, дұрыс жауапты тап.',
    lobby: 'Күту бөлмесі', gameOver: 'Ойын аяқталды', waitingPlayers: 'Ойыншыларды күтеміз', turn: 'Жүріс {current} / {total}', invite: 'Шақыру', players: 'Ойыншылар', leave: 'Шығу',
    reconnecting: 'Байланыс үзілді. Қайта қосылуда…', player: 'Ойыншы', you: 'сен', host: 'жүргізуші', readyStatus: 'Дайын', inRoom: 'Бөлмеде', explaining: 'Түсіндіреді', guessing: 'Сөзді табады', miner: 'Мина қоюшы', explainer: 'Түсіндіруші', guesser: 'Сөз табушы', roleCounts: 'Түсіндірді: {explained} · Тапты: {guessed}', removePlayer: '{name} ойыншысын шығару',
    leaveTitle: 'Бөлмеден шығасың ба?', leaveLobby: 'Сол код пен лақап атың арқылы қайта кіре аласың.', leaveGame: 'Ұпайың сақталады. Қажет болса, жүріс қайта басталады немесе ойын кідіртіледі.',
    removeTitle: 'Ойыншыны шығару керек пе?', removeMessage: '{name} бөлмеден шығады. Ұпайы сақталады.', remove: 'Шығару',
    lobbyTitle: 'Күту бөлмесіне оралу керек пе?', lobbyMessage: 'Қазіргі ойын аяқталады. Баптауларды өзгертіп, қайта бастауға болады.', toLobby: 'Бөлмеге оралу',
    skipTitle: 'Жүрісті өткізу керек пе?', skipMessage: 'Бұл жүрісте ешкім ұпай алмайды.', skip: 'Жүрісті өткізу', claimTitle: 'Мина сөзі айтылды ма?', claimMessage: '«{word}» сөзі туралы хабарлау керек пе? Жүргізуші тексереді.', report: 'Хабарлау', cancel: 'Бас тарту',
    settings: 'Баптаулар', duration: 'Түсіндіру уақыты', untimed: 'Уақыт шектеусіз', cycles: 'Айналым саны', miningSettings: 'Миналар мен сөздік', miningTime: 'Мина қою уақыты', sixtySeconds: '60 секунд',
    wordLanguage: 'Сөздер тілі', defaultWords: 'Кіріктірілген сөздік: {count} сөз', customWords: 'Өз сөздерің', customPlaceholder: 'Әр жолға бір сөз жаз немесе үтірмен бөл', customHelp: '1000 сөзге дейін. Әр сөзде ең көбі 60 таңба.', save: 'Сақтау', saved: 'Баптаулар сақталды.',
    waitingStart: 'Ойынның басталуын күтеміз', waitingHost: 'Жүргізуші: {name}. Ойынды бастау үшін кемінде 3 ойыншы керек.', playerCount: 'Ойыншылар: {count}', needThree: 'Бастау үшін кемінде 3 ойыншы керек.', canStart: 'Бастауға болады.', ready: 'Мен дайынмын', start: 'Ойынды бастау',
    pause: 'Ойын кідіртілді', pauseHelp: 'Тағы {count} ойыншы керек. Үшеу жиналғанда ойын автоматты түрде жалғасады. Ұпайлар сақталады.',
    secret: 'Құпия сөз', partnerKnows: 'Сөзді серігің біледі', listenTo: '{name} сөзді түсіндіреді. Мұқият тыңда.', keepSecret: 'Бұл экранды сөз табушыға көрсетпе.', redraw: 'Сөзді ауыстыру', redrawHelp: 'Алғашқы мина қойылғанша ауыстыруға болады. Таймер қайта басталады.',
    sharedMines: 'Ойыншылардың миналары', minersOnly: 'Тек мина қоюшылар көреді.', choosingMine: 'Таңдауда…', noMine: 'Мина жоқ', miningTitle: 'Сөз-мина қой', miningWaiting: 'Ойыншылар мина қойып жатыр', miningHint: 'Түсіндіруде немесе жауапта қандай сөз айтылуы мүмкін?', miningWaitHint: 'Таймер аяқталғанда түсіндіру басталады.',
    yourMine: 'Сенің минаң', replaceHint: 'Таймер аяқталғанша ауыстыруға болады.', minePlaceholder: 'Сөз немесе сөз тіркесі', mineInput: 'Сөз-мина', replaceMine: 'Минаны ауыстыру', placeMine: 'Мина қою', mineLimit: 'Бос орындармен қоса, ең көбі 20 таңба.', mineCount: 'Қойылған миналар: {placed} / {total}',
    explainTitle: 'Сөзді түсіндір', guessTitle: 'Сөзді тап', listenTitle: 'Өз минаңды тыңда', activePair: '{explainer} түсіндіреді · {guesser} табады', guessPlaceholder: 'Сенің жауабың', answer: 'Жауап', submitGuess: 'Тексеру', wrongGuess: '«{word}» — әзірге қате.', reportHint: 'Сөз айтылса, жүргізушіге хабарла.', claim: 'Менің минам іске қосылды', noMineHint: 'Бұл жүрісте минаң жоқ. Келесі жүрісте қоя аласың.', guessedAloud: 'Сөз дауыстап табылды',
    claimHeading: 'Мина туралы хабарлама', claimBy: '{name} мына сөз туралы хабарлады:', hostChecking: 'Жүргізуші тексеріп жатыр.', acceptClaim: 'Растау', rejectClaim: 'Қабылдамау', waitDecision: 'Жүргізушінің шешімін күтеміз.',
    resultGuessed: 'Сөз табылды!', resultExploded: 'Мина іске қосылды!', resultTimeout: 'Уақыт бітті', resultSkipped: 'Жүріс өткізілді', pointsAwarded: '{names} — әрқайсысына +1 ұпай', noPoints: 'Бұл жүрісте ұпай берілмеді.', roundMines: 'Осы жүрістегі миналар', noRoundMines: 'Мина қойылмады.', next: 'Келесі жүріс', gameResults: 'Ойын қорытындысы', waitNext: 'Келесі жүрісті күтеміз.', role: 'Сенің рөлің: {role}', timeLeft: 'Мина қоюға қалған уақыт', checking: 'Тексерілуде',
    scoreboard: 'Ұпайлар кестесі', place: 'Орын', score: 'Ұпай', winner: 'Жеңімпаз: {name}', tied: 'Тең нәтиже', tiedNames: 'Бірінші орын: {names}', playAgain: 'Қайта ойнау', waitNewGame: 'Жүргізуші күту бөлмесінде жаңа ойын бастай алады.',
    copied: 'Сілтеме көшірілді.', inviteTitle: 'Достарды шақыру', inviteHelp: 'Сілтемені достарыңа жібер. Кіру үшін тек лақап ат керек.', inviteLink: 'Бөлме сілтемесі', done: 'Дайын', welcomeBack: 'Қайта оралуыңмен! Ұпайың сақталды.',
    serverUnavailable: 'Сервер қолжетімсіз. Байланысты тексер.', requestFailed: 'Сұрауды орындау мүмкін болмады.',
    rulesTitle: 'Қалай ойнау керек', rulesRoles: 'Рөлдер', rulesRolesText: 'Кемінде 3 ойыншы. Бірі түсіндіреді, екіншісі табады, қалғандары мина қояды. Бір үстелде немесе дауыстық қоңырауда сөйлесіңдер.',
    rulesMines: 'Сөз-миналар', rulesMinesText: 'Құпия сөзді сөз табушыдан басқаның бәрі көреді. Мина қоюшыларға ең көбі 20 таңбадан тұратын сөз не сөз тіркесін қоюға 60 секунд беріледі. Таймер біткенше минаны ауыстыруға болады. Мина қоюшылар бір-бірінің миналарын көреді, түсіндіруші мен сөз табушы көрмейді. Түсіндіруші алғашқы мина қойылғанша құпия сөзді ауыстыра алады.',
    rulesExplain: 'Түсіндіру және жауап', rulesExplainText: 'Таймерден кейін уақыт шектеусіз түсіндіріңдер. Сөздің өзін, түбірлес сөздерді немесе аудармасын айтуға болмайды. Жауапты жазуға не дауыстап айтуға болады. Бас және кіші әріптер, орыс тіліндегі ё/е айырмасы ескерілмейді.',
    rulesClaim: 'Минаның іске қосылуы', rulesClaimText: 'Мина сөзі айтылса, оны қойған ойыншы жүргізушіге хабарлайды. Жүргізуші растайды немесе қабылдамайды. Сөздің басқа түрлері есептеле ме — алдын ала келісіңдер.',
    rulesScore: 'Ұпайлар мен рөлдер', rulesScoreText: 'Дұрыс жауап үшін түсіндіруші мен сөз табушыға 1 ұпайдан беріледі. Мина іске қосылса, сол сөзді қойғандарға 1 ұпайдан беріледі. Әр жүрістен кейін ұпайлар кестесі көрсетіледі. Бір айналымда әркім түсіндіреді және сөз табады. Үштен аз ойыншы қалса, ойын кідіртіледі.'
  }
};

const spyMessages = {
  "gameMode": [
    "Игра",
    "Game",
    "Ойын"
  ],
  "wordmine": [
    "Word Mine",
    "Word Mine",
    "Word Mine"
  ],
  "spy": [
    "Шпион",
    "Spy",
    "Тыңшы"
  ],
  "innocent": [
    "Мирный",
    "Innocent",
    "Бейбіт ойыншы"
  ],
  "spectator": [
    "Наблюдатель",
    "Spectator",
    "Көрермен"
  ],
  "gameHubTitle": [
    "Слова объединяют.",
    "Words bring us together.",
    "Сөздер біріктіреді."
  ],
  "gameHubAccent": [
    "Кому ты доверяешь?",
    "Who do you trust?",
    "Кімге сенесің?"
  ],
  "gameHubHelp": [
    "Две игры для компании от 3 человек. Выбирайте игру и приглашайте друзей.",
    "Two party games for 3 or more. Pick a game and invite your friends.",
    "3 немесе одан көп адамға арналған екі ойын. Ойынды таңдап, достарыңды шақыр."
  ],
  "spyHelp": [
    "Найди того, кто не знает слово. Ассоциации, подозрения и тайное голосование.",
    "Find the player who doesn’t know the word. Clues, suspicion, and secret votes.",
    "Сөзді білмейтін ойыншыны тап. Ассоциациялар, күдік және жасырын дауыс."
  ],
  "spyRules": [
    "Один случайный шпион видит только тему, мирные — слово. По очереди введите по одной ассоциации, затем голосуйте. Большинство больше половины предлагает исключение, ведущий подтверждает. Без большинства — новый круг ассоциаций. Исключённые остаются в комнате. Когда остаются двое, ведущий подтверждает победу шпиона. Он также может завершить раунд после ассоциаций. Мирные получают по 1 очку за поимку шпиона. Незамеченный шпион — 3 очка. Пойманный шпион получает одну попытку угадать слово и 1 очко за верный ответ. Все очки подтверждает ведущий.",
    "One random spy sees only a topic; innocents see the word. Take turns entering one clue word, then vote. More than half of active players must agree to propose an elimination; the leader confirms it. No majority means another clue cycle. Eliminated players stay in the room. With two players left, the leader confirms the spy’s win. The leader can also end a round after clues. Each innocent gets 1 point for catching the spy. An undetected spy gets 3 points. A caught spy gets one guess and 1 point if correct. The leader confirms all points.",
    "Кездейсоқ таңдалған бір тыңшы тек тақырыпты, бейбіт ойыншылар сөзді көреді. Кезекпен бір ассоциация енгізіп, дауыс беріңдер. Шығару үшін белсенді ойыншылардың жартысынан көбі дауыс беріп, жүргізуші растауы керек. Көпшілік болмаса, ассоциациялар қайталанады. Шығарылғандар бөлмеде қалады. Екі ойыншы қалса, жүргізуші тыңшының жеңісін растайды. Ассоциациялардан кейін раундты да аяқтай алады. Тыңшы ұсталса, әр бейбіт ойыншыға 1 ұпай. Ұсталмаған тыңшыға 3 ұпай. Ұсталған тыңшы сөзді бір рет таба алады: дұрыс болса, 1 ұпай. Барлық ұпайды жүргізуші растайды."
  ],
  "spyRounds": [
    "Раундов",
    "Rounds",
    "Раунд саны"
  ],
  "spyDictionary": [
    "Словарь и подсказки",
    "Words and hints",
    "Сөздер мен кеңестер"
  ],
  "spyCustomHelp": [
    "Каждая строка: слово | подсказка. Например: Пицца | Еда. До 60 символов вместе.",
    "Each line: word | hint. Example: Pizza | Food. Up to 60 characters combined.",
    "Әр жол: сөз | кеңес. Мысалы: Пицца | Тағам. Барлығы 60 таңбаға дейін."
  ],
  "spyHint": [
    "Твоя подсказка",
    "Your hint",
    "Сенің кеңесің"
  ],
  "spyKeep": [
    "Сохраняй роль в тайне. Не показывай экран другим.",
    "Keep your role secret. Don’t show your screen.",
    "Рөліңді құпия сақта. Экраныңды көрсетпе."
  ],
  "spySpeaking": [
    "Ассоциации · круг {count}",
    "Clues · cycle {count}",
    "Ассоциациялар · айналым {count}"
  ],
  "spySpeaker": [
    "{name} даёт ассоциацию.",
    "{name} is giving a clue.",
    "{name} ассоциация береді."
  ],
  "spyClue": [
    "Одна ассоциация",
    "One clue word",
    "Бір ассоциация"
  ],
  "spySubmit": [
    "Сказать слово",
    "Give clue",
    "Сөз айту"
  ],
  "spyVoteTitle": [
    "Кто шпион?",
    "Who is the spy?",
    "Тыңшы кім?"
  ],
  "spyVoteHelp": [
    "Голоса скрыты до конца голосования. Ведущий подтверждает исключение.",
    "Votes stay hidden until everyone votes. The leader confirms eliminations.",
    "Барлығы дауыс бергенше дауыстар жасырын. Шығаруды жүргізуші растайды."
  ],
  "spyVote": [
    "Голосовать",
    "Vote",
    "Дауыс беру"
  ],
  "spyAbstain": [
    "Никого не исключать",
    "Skip elimination",
    "Ешкімді шығармау"
  ],
  "spyVoted": [
    "Твой голос принят.",
    "Your vote is in.",
    "Дауысың қабылданды."
  ],
  "spyVotes": [
    "Проголосовали: {count} / {total}",
    "Votes: {count} / {total}",
    "Дауыс берді: {count} / {total}"
  ],
  "spyCandidate": [
    "Большинство предлагает исключить: {name}.",
    "The majority proposes eliminating {name}.",
    "Көпшілік {name} ойыншысын шығаруды ұсынады."
  ],
  "spyNoMajority": [
    "Большинства нет. Продолжайте ассоциации.",
    "No majority. Continue with another clue cycle.",
    "Көпшілік жоқ. Ассоциацияларды жалғастырыңдар."
  ],
  "spyEliminate": [
    "Подтвердить исключение",
    "Confirm elimination",
    "Шығаруды растау"
  ],
  "spyContinue": [
    "Продолжить ассоциации",
    "Continue clues",
    "Ассоциацияларды жалғастыру"
  ],
  "spyUndetected": [
    "Подтвердить: шпион не найден (+3)",
    "Confirm: spy undetected (+3)",
    "Растау: тыңшы ұсталмады (+3)"
  ],
  "spyUndetectedConfirm": [
    "Завершить раунд и дать шпиону 3 очка? Его роль откроется всем.",
    "End the round and award the spy 3 points? Their role will be revealed.",
    "Раундты аяқтап, тыңшыға 3 ұпай берілсін бе? Рөлі барлығына ашылады."
  ],
  "spyCaught": [
    "Шпион пойман: {name}",
    "Spy caught: {name}",
    "Тыңшы ұсталды: {name}"
  ],
  "spyGuessHelp": [
    "Последний шанс: угадай секретное слово. Ведущий подтвердит ответ.",
    "One last chance: guess the secret word. The leader confirms the answer.",
    "Соңғы мүмкіндік: құпия сөзді тап. Жауапты жүргізуші растайды."
  ],
  "spyGuessWaiting": [
    "Ждём единственную попытку шпиона.",
    "Waiting for the spy’s one guess.",
    "Тыңшының жалғыз жауабын күтеміз."
  ],
  "spyGuessReview": [
    "Ответ шпиона: «{word}». Ведущий подтверждает точность.",
    "Spy’s guess: “{word}”. The leader confirms whether it is correct.",
    "Тыңшының жауабы: «{word}». Дұрыстығын жүргізуші растайды."
  ],
  "spyCorrect": [
    "Верно: мирным +1, шпиону +1",
    "Correct: innocents +1, spy +1",
    "Дұрыс: бейбіттерге +1, тыңшыға +1"
  ],
  "spyWrong": [
    "Неверно: только мирным +1",
    "Incorrect: innocents +1 only",
    "Қате: тек бейбіттерге +1"
  ],
  "spyWin": [
    "Шпион остался незамеченным",
    "The spy went undetected",
    "Тыңшы ұсталмады"
  ],
  "spyInnocentWin": [
    "Мирные нашли шпиона",
    "The innocents caught the spy",
    "Бейбіттер тыңшыны тапты"
  ],
  "spyIdentity": [
    "Шпион: {name}",
    "Spy: {name}",
    "Тыңшы: {name}"
  ],
  "spyAward": [
    "{name}: +{points}",
    "{name}: +{points}",
    "{name}: +{points}"
  ],
  "spyEliminated": [
    "Исключён из раунда",
    "Eliminated this round",
    "Раундтан шығарылды"
  ],
  "spySpectating": [
    "Ты присоединишься к следующему раунду.",
    "You’ll play in the next round.",
    "Келесі раундқа қатысасың."
  ],
  "spyFinalTwo": [
    "Осталось двое: ведущий подтверждает победу оставшихся скрытых ролей.",
    "Two players remain: the leader confirms the surviving hidden roles’ win.",
    "Екі ойыншы қалды: жүргізуші қалған жасырын рөлдердің жеңісін растайды."
  ]
};
for (const [key, values] of Object.entries(spyMessages)) {
  ['ru', 'en', 'kk'].forEach((lang, index) => { messages[lang][key] = values[index]; });
}

const homeMessages = {
  "clubLabel": [
    "Игры для своих",
    "Good company. Great games.",
    "Достарға арналған ойындар"
  ],
  "homeLineOne": [
    "Все в сборе?",
    "Everyone here?",
    "Бәрі жиналды ма?"
  ],
  "homeLineTwo": [
    "Начинаем.",
    "Let’s play.",
    "Бастаймыз."
  ],
  "homeIntro": [
    "Собери друзей за столом или в звонке.\nДальше — дело за словами.",
    "Get your people around a table or on a call.\nWe’ll take it from here.",
    "Достарыңды үстел басына не қоңырауға жина.\nӘрі қарай сөздер сөйлесін."
  ],
  "chooseMove": [
    "Выбери свой ход",
    "Make your move",
    "Өз жүрісіңді таңда"
  ],
  "joinHeading": [
    "Есть код?",
    "Got a code?",
    "Кодың бар ма?"
  ],
  "joinDescription": [
    "Твои уже внутри. Введи код комнаты и присоединяйся.",
    "Your friends are waiting. Enter their room code and pull up a chair.",
    "Достарың сені күтуде. Бөлме кодын енгізіп, қосыл."
  ],
  "joinCodeLabel": [
    "Код от друзей",
    "Room code from your friends",
    "Достарыңның бөлме коды"
  ],
  "createSpy": [
    "Создать лобби «Шпион»",
    "Create Spy lobby",
    "«Тыңшы» бөлмесін ашу"
  ],
  "createWordmine": [
    "Создать лобби Wordmines",
    "Create Wordmines lobby",
    "Wordmines бөлмесін ашу"
  ],
  "spyShort": [
    "Кто-то знает слово.\nКто-то просто делает вид.",
    "Some know the word.\nOthers are making it up.",
    "Бірі сөзді біледі.\nБірі білетіндей көрінеді."
  ],
  "wordmineShort": [
    "Объясняй слова. Обходи ловушки.\nУ друзей на тебя свои планы.",
    "Explain the word. Dodge the traps.\nYour friends have other plans.",
    "Сөзді түсіндір. Тұзақтардан өт.\nДостарыңның өз жоспары бар."
  ],
  "spyCategory": [
    "Секретные роли",
    "Secret identities",
    "Құпия рөлдер"
  ],
  "wordmineCategory": [
    "Слова и ловушки",
    "Words & traps",
    "Сөздер мен тұзақтар"
  ],
  "joinCategory": [
    "Вместе с друзьями",
    "Join your people",
    "Достарыңа қосыл"
  ],
  "playersThree": [
    "3+ игрока",
    "3+ players",
    "3+ ойыншы"
  ],
  "noDownloads": [
    "Без регистрации. Без установки.",
    "No sign-ups. No downloads.",
    "Тіркелусіз. Орнатусыз."
  ],
  "justFriends": [
    "Только ты и твои люди.",
    "Just you and your people.",
    "Тек сен және достарың."
  ],
  "backGames": [
    "Все игры",
    "All games",
    "Барлық ойындар"
  ],
  "createIntro": [
    "Ты будешь ведущим. Пригласи друзей по коду — и можно начинать.",
    "You’re the leader. Invite your friends with a room code, then start when you’re ready.",
    "Сен жүргізуші боласың. Достарыңды кодпен шақырып, дайын болғанда баста."
  ],
  "joinIntro": [
    "Осталось представиться. Используй прежний ник, если возвращаешься.",
    "One last thing: what should we call you? Use your previous nickname if you’re returning.",
    "Өзіңді таныстыр. Қайта қосылсаң, бұрынғы атыңды қолдан."
  ],
  "homeAria": [
    "Room6 — главная",
    "Room6 — home",
    "Room6 — басты бет"
  ],
  "roomRules": [
    "Правила этого раунда",
    "How this game works",
    "Бұл ойынның ережелері"
  ]
};
for (const [key, values] of Object.entries(homeMessages)) {
  ['ru', 'en', 'kk'].forEach((lang, index) => { messages[lang][key] = values[index]; });
}

const roleMessages = {
  "spyCount": [
    "Шпионов",
    "Spies",
    "Тыңшылар саны"
  ],
  "mrWhite": [
    "Мистер Уайт",
    "Mr. White",
    "Мистер Уайт"
  ],
  "mrWhiteHelp": [
    "Без слова и подсказки. +5 за победу незамеченным.",
    "No word. No hint. +5 for winning undetected.",
    "Сөз де, кеңес те жоқ. Ұсталмай жеңсе: +5."
  ],
  "whiteBlank": [
    "Ни слова. Ни подсказки.",
    "No word. No hint.",
    "Сөз де, кеңес те жоқ."
  ],
  "whitePlay": [
    "Слушай ассоциации и импровизируй. Твоя цель — остаться незамеченным.",
    "Listen to the clues and improvise. Your goal is to stay undetected.",
    "Ассоциацияларды тыңдап, тапқыр бол. Мақсатың — ұсталмау."
  ],
  "roleSetup": [
    "Состав ролей",
    "Role lineup",
    "Рөлдер құрамы"
  ],
  "roleSetupHelp": [
    "Нужен хотя бы один мирный. Изменения между раундами действуют со следующего раунда.",
    "Keep at least one innocent. Between-round changes apply to the next round.",
    "Кемінде бір бейбіт ойыншы қажет. Өзгерістер келесі раундта қолданылады."
  ],
  "nextRoles": [
    "Роли следующего раунда",
    "Next round’s roles",
    "Келесі раундтың рөлдері"
  ],
  "roleCountSummary": [
    "Шпионов: {count} · Мистер Уайт: {white}",
    "Spies: {count} · Mr. White: {white}",
    "Тыңшылар: {count} · Мистер Уайт: {white}"
  ],
  "enabled": [
    "Включён",
    "On",
    "Қосулы"
  ],
  "disabled": [
    "Выключен",
    "Off",
    "Өшірулі"
  ],
  "revealRole": [
    "Открыть свою роль",
    "Reveal your role",
    "Рөліңді аш"
  ],
  "revealPrivate": [
    "Только для твоих глаз",
    "For your eyes only",
    "Тек сен үшін"
  ],
  "hideRole": [
    "Скрыть роль",
    "Hide role",
    "Рөлді жасыру"
  ],
  "innocentsReady": [
    "Мирные победили. Ведущий подтверждает очки.",
    "All hidden roles are out. The leader confirms the innocents’ points.",
    "Барлық жасырын рөлдер шығарылды. Жүргізуші ұпайды растайды."
  ],
  "confirmInnocents": [
    "Подтвердить: мирным по +1",
    "Confirm: +1 to each innocent",
    "Растау: әр бейбітке +1"
  ],
  "spyBonusCorrect": [
    "Верно: этому шпиону +1",
    "Correct: +1 to this spy",
    "Дұрыс: осы тыңшыға +1"
  ],
  "spyBonusWrong": [
    "Ответ неверный",
    "Guess is incorrect",
    "Жауап қате"
  ],
  "bonusHelp": [
    "Бонус сохранится и начислится в конце раунда. Пока остаются скрытые роли, игра продолжается.",
    "The bonus is recorded and awarded at the end of the round. Play continues while hidden roles remain.",
    "Бонус раунд соңында беріледі. Жасырын рөлдер қалса, ойын жалғасады."
  ],
  "hiddenWin": [
    "Скрытые роли остались незамеченными",
    "Hidden roles went undetected",
    "Жасырын рөлдер ұсталмады"
  ],
  "confirmHiddenWin": [
    "Подтвердить победу скрытых ролей",
    "Confirm hidden-role win",
    "Жасырын рөлдердің жеңісін растау"
  ],
  "hiddenWinConfirm": [
    "Завершить раунд? Каждый оставшийся шпион получит 3 очка, Мистер Уайт — 5.",
    "End the round? Each surviving spy earns 3 points; surviving Mr. White earns 5.",
    "Раунд аяқталсын ба? Ұсталмаған әр тыңшыға 3, Мистер Уайтқа 5 ұпай."
  ],
  "roleRequirements": [
    "Для этого состава нужно минимум {count} игроков.",
    "This lineup needs at least {count} players.",
    "Бұл құрамға кемінде {count} ойыншы қажет."
  ],
  "whiteIdentity": [
    "Мистер Уайт: {name}",
    "Mr. White: {name}",
    "Мистер Уайт: {name}"
  ],
  "rolesScoring": [
    "Мирные +1 · Шпионы +3 · Уайт +5",
    "Innocents +1 · Spies +3 · White +5",
    "Бейбіттер +1 · Тыңшылар +3 · Уайт +5"
  ]
};
for (const [key, values] of Object.entries(roleMessages)) {
  ['ru', 'en', 'kk'].forEach((lang, index) => { messages[lang][key] = values[index]; });
}
messages.ru.spyRules = 'Настройте роли, затем по очереди давайте по одной ассоциации и голосуйте. Для исключения нужно больше половины голосов активных игроков и подтверждение ведущего. Мирные видят слово, шпионы — подсказку, Мистер Уайт не видит ничего. Пойманный шпион один раз угадывает слово: ведущий может подтвердить бонус +1. Игра продолжается, пока остаются скрытые роли. Мирные получают по +1 после поимки всех. При победе скрытых ролей каждый оставшийся шпион получает +3, Уайт — +5. Все очки подтверждает ведущий. Роли можно менять до игры и между раундами.';
messages.en.spyRules = 'Configure roles, take turns giving one clue word, then vote. An elimination needs more than half of active votes and leader confirmation. Innocents see the word; spies see a hint; Mr. White sees neither. Each caught spy gets one guess, worth +1 if the leader confirms it. Play continues while hidden roles remain. Innocents earn +1 each after all hidden players are caught. On a hidden-role win, each surviving spy earns +3 and surviving Mr. White earns +5. The leader confirms all points. Role settings can change before play and between rounds.';
messages.kk.spyRules = 'Рөлдерді баптап, кезекпен бір ассоциация айтып, дауыс беріңдер. Шығару үшін белсенді ойыншылардың жартысынан көбі дауыс беріп, жүргізуші растауы керек. Бейбіттер сөзді, тыңшылар кеңесті көреді, Мистер Уайт ештеңе көрмейді. Ұсталған тыңшы бір рет жауап береді: жүргізуші растаса +1. Жасырын рөлдер қалса, ойын жалғасады. Барлығы ұсталса, әр бейбітке +1. Жасырын рөлдер жеңсе, ұсталмаған әр тыңшыға +3, Уайтқа +5. Барлық ұпайды жүргізуші растайды. Рөлдер ойын алдында және раундтар арасында өзгертіледі.';

const switchMessages = {
  "gameSwitchHelp": [
    "Ведущий выбирает игру для всей комнаты",
    "The leader chooses the game for everyone",
    "Жүргізуші барлығына ойын таңдайды"
  ],
  "gameChanged": [
    "{name} переключает комнату на {game}.",
    "{name} switched the room to {game}.",
    "{name} бөлмені {game} ойынына ауыстырды."
  ],
  "wordmineMood": [
    "Тёплый приём. Опасные слова.",
    "Warm company. Dangerous words.",
    "Жылы орта. Қауіпті сөздер."
  ],
  "spyMood": [
    "Холодная голова. Свои подозрения.",
    "Keep your cool. Trust your instincts.",
    "Сабыр сақта. Түйсігіңе сен."
  ]
};
for (const [key, values] of Object.entries(switchMessages)) {
  ['ru', 'en', 'kk'].forEach((lang, index) => { messages[lang][key] = values[index]; });
}
messages.ru.chooseGame='Во что играем?';
messages.en.chooseGame='Choose a game.';
messages.kk.chooseGame='Қай ойынды ойнаймыз?';
messages.ru.spyShort='Найди тех, кто не знает слово.';
messages.en.spyShort='Find who doesn’t know the word.';
messages.kk.spyShort='Сөзді білмейтіндерді тап.';
messages.ru.wordmineShort='Объясняй слова, не задевая мины.';
messages.en.wordmineShort='Explain words. Avoid the mines.';
messages.kk.wordmineShort='Сөзді түсіндір. Миналарға түспе.';
const bughouseMessages = {
  bughouse: ['Шведские шахматы', 'Bughouse Chess', 'Швед шахматы'],
  createBughouse: ['Создать шахматную комнату', 'Create chess room', 'Шахмат бөлмесін ашу'],
  playersFour: ['4 игрока', '4 players', '4 ойыншы'],
  bughouseShort: ['Две доски, две команды. Передавай взятые фигуры напарнику.', 'Two boards, two teams. Send captured pieces to your partner.', 'Екі тақта, екі команда. Алған фигураларыңды серіктесіңе бер.'],
  bughouseRules: ['Играют четверо на двух досках без часов. Напарники играют разными цветами. Взятая фигура попадает в запас напарника: в свой ход он может поставить её на свободную клетку. Пешки нельзя ставить на первую или последнюю горизонталь. При взятии превращённая фигура снова становится пешкой. Мат с учётом имеющегося запаса или сдача на любой доске решают исход всей партии. Пат или согласие всех игроков дают ничью.', 'Four players use two boards with no clocks. Partners play opposite colors. Captures go to your partner’s reserve, and they can spend a turn dropping one on an empty square. Pawns cannot be dropped on either back rank. Captured promoted pieces return to the reserve as pawns. Checkmate, based on the pieces already in reserve, or a resignation on either board decides the match. Stalemate or agreement by all four players ends it in a draw.', 'Төрт ойыншы екі тақтада сағатсыз ойнайды. Серіктестер қарама-қарсы түспен ойнайды. Алған фигураң серіктесіңнің қорына түседі. Ол өз жүрісінде қордағы фигураны бос ұяшыққа қоя алады. Пешканы бірінші не соңғы қатарға қоюға болмайды. Алынған түрленген фигура қорға пешка болып түседі. Қордағы фигураларды ескергендегі мат немесе бір тақтада берілу бүкіл матчты аяқтайды. Пат немесе төрт ойыншының келісімі тең ойынмен аяқталады.'],
  chessWaiting: ['Ведущий сможет начать партию, когда соберутся четыре игрока.', 'The host can start once all four players have joined.', 'Төрт ойыншы жиналғанда жүргізуші матчты бастай алады.'],
  chessTeam: ['Команда {team}', 'Team {team}', '{team}-команда'],
  chessChoosePartner: ['Кто будет твоим напарником?', 'Choose your partner', 'Серіктесіңді таңда'],
  chessSwapColors: ['Поменять цвета', 'Swap colors', 'Түстерді ауыстыру'],
  chessEmptySeat: ['Свободное место', 'Open seat', 'Бос орын'],
  chessWhite: ['Белые', 'White', 'Ақтар'],
  chessBlack: ['Чёрные', 'Black', 'Қаралар'],
  chessYourBoard: ['Твоя доска', 'Your board', 'Өз тақтаң'],
  chessPartnerBoard: ['Доска напарника', 'Partner’s board', 'Серіктесіңнің тақтасы'],
  chessBoardA: ['Доска А', 'Board A', 'А тақтасы'],
  chessBoardB: ['Доска Б', 'Board B', 'Б тақтасы'],
  chessReserve: ['Запас фигур', 'Piece reserve', 'Фигуралар қоры'],
  chessEmptyReserve: ['Запас пуст', 'Empty reserve', 'Қор бос'],
  chessReservePiece: ['{piece} в запасе — {count}', '{piece} in reserve, {count}', 'Қорда {count} {piece}'],
  chessPiece: ['{piece}, {color}', '{color} {piece}', '{color}, {piece}'],
  chessEmptySquare: ['пусто', 'empty', 'бос'],
  pawn: ['пешка', 'pawn', 'пешка'],
  knight: ['конь', 'knight', 'ат'],
  bishop: ['слон', 'bishop', 'піл'],
  rook: ['ладья', 'rook', 'тура'],
  queen: ['ферзь', 'queen', 'уәзір'],
  king: ['король', 'king', 'патша'],
  chessYourTurn: ['Твой ход', 'Your turn', 'Сенің жүрісің'],
  chessToMove: ['Ходит {name}', '{name} to move', '{name} жүреді'],
  chessCheck: ['Шах', 'Check', 'Шах'],
  chessWinner: ['Победа команды {team}', 'Team {team} wins', '{team}-команда жеңді'],
  chessDrawn: ['Ничья', 'Draw', 'Тең ойын'],
  chessResult_checkmate: ['Партия завершилась матом.', 'The match ended in checkmate.', 'Мат қойылып, матч аяқталды.'],
  chessResult_stalemate: ['Партия завершилась патом.', 'The match ended in stalemate.', 'Пат болып, матч аяқталды.'],
  chessResult_resignation: ['Один из игроков сдался.', 'A player resigned.', 'Ойыншылардың бірі берілді.'],
  chessResult_agreement: ['Все игроки согласились на ничью.', 'All four players agreed to a draw.', 'Төрт ойыншы да тең ойынға келісті.'],
  chessPromote: ['Во что превратить пешку?', 'Promote pawn to', 'Пешканы қай фигураға айналдырасың?'],
  chessResign: ['Сдаться', 'Resign', 'Берілу'],
  chessResignTitle: ['Сдаться?', 'Resign this match?', 'Осы матчта берілесің бе?'],
  chessResignHelp: ['Твоя команда проиграет на обеих досках.', 'The other team will win the match.', 'Қарсы команда матчта жеңеді.'],
  chessLeaveHelp: ['Выход из активной партии считается сдачей. Ты сможешь вернуться по тому же коду и нику.', 'Leaving now counts as resignation. You can return using the same code and nickname.', 'Қазір шықсаң, берілген болып саналасың. Сол код пен лақап атпен қайта кіре аласың.'],
  chessKickHelp: ['Если исключить игрока {name}, его команда проиграет.', 'Removing {name} will forfeit the match for their team.', '{name} ойыннан шығарылса, оның командасы жеңіледі.'],
  chessOfferDraw: ['Предложить ничью', 'Agree to draw', 'Тең ойынға келісу'],
  chessWithdrawDraw: ['Отозвать согласие', 'Withdraw draw vote', 'Келісімді қайтару'],
  chessDrawVotes: ['За ничью: {count} из 4', 'Draw votes: {count} of 4', 'Тең ойынға дауыс: {count}/4']
};
for (const [key, values] of Object.entries(bughouseMessages)) {
  ['ru', 'en', 'kk'].forEach((lang, index) => { messages[lang][key] = values[index]; });
}
let language = 'ru';
try { const saved = typeof window === 'undefined' ? null : localStorage.getItem('word-mine-language'); if (Object.hasOwn(languages, saved)) language = saved; } catch {}
export const getLanguage = () => language;
export function setLanguage(value) {
  if (!(Object.hasOwn(languages, value))) return;
  language = value;
  try { localStorage.setItem('word-mine-language', value); } catch {}
  document.documentElement.lang = value;
  window.dispatchEvent(new Event('wordmine:language'));
}
export function t(key, values = {}) {
  const template = messages[language][key] ?? messages.ru[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

// API messages remain stable for old clients; localize them at the display boundary.
export const errorMessages = [
  ['В шахматной комнате уже четыре игрока.', 'The chess room already has four players.', 'Шахмат бөлмесінде төрт ойыншы бар.'],
  ['Для шахмат нужны ровно четыре игрока.', 'Bughouse requires exactly four players.', 'Швед шахматына дәл төрт ойыншы керек.'],
  ['Эта партия уже завершилась или сменилась.', 'This match has ended or changed.', 'Бұл матч аяқталды немесе ауысты.'],
  ['В этой партии вы наблюдатель.', 'You are watching this match.', 'Сен бұл матчты көріп отырсың.'],
  ['Сейчас ход соперника.', 'It is your opponent’s turn.', 'Қазір қарсыласыңның жүрісі.'],
  ['Недопустимый ход.', 'Illegal move.', 'Бұл жүріске рұқсат жоқ.'],
  ['Сюда нельзя поставить эту фигуру.', 'You cannot drop that piece here.', 'Бұл фигураны мұнда қоя алмайсың.'],
  ["Добавьте хотя бы одного шпиона или Мистера Уайта.", "Add at least one spy or Mr. White.", "Кемінде бір тыңшыны немесе Мистер Уайтты қос."],
  ["Оставьте хотя бы одно место для мирного игрока.", "Leave at least one place for an innocent.", "Бейбіт ойыншыға кемінде бір орын қалдыр."],
  ["Недостаточно игроков для выбранных ролей.", "Not enough players for this role lineup.", "Бұл рөлдерге ойыншы саны жеткіліксіз."],
  ["Меняйте роли между раундами.", "Change roles between rounds.", "Рөлдерді раундтар арасында өзгерт."],
  ["Число шпионов: от 0 до 1000000.", "Spies: from 0 to 1,000,000.", "Тыңшылар саны: 0–1 000 000."],

  ["Неизвестная игра.", "Unknown game.", "Белгісіз ойын."],
  ["Для каждого слова шпиона укажите: слово | подсказка.", "Use word | hint for each custom Spy word.", "Әр тыңшы сөзі үшін сөз | кеңес пішімін қолдан."],
  ["Дождитесь своей очереди для ассоциации.", "Wait for your clue turn.", "Ассоциация айту кезегіңді күт."],
  ["Введите одну ассоциацию до 40 символов без пробелов.", "Enter one clue word, up to 40 characters.", "Бос орынсыз, 40 таңбаға дейін бір ассоциация енгіз."],
  ["Нельзя называть секретное слово.", "Do not say the secret word.", "Құпия сөзді айтуға болмайды."],
  ["Сейчас голосуют только активные игроки.", "Only active players can vote now.", "Қазір тек белсенді ойыншылар дауыс бере алады."],
  ["Это голосование уже завершено.", "This ballot has changed.", "Бұл дауыс беру аяқталды."],
  ["Выберите другого активного игрока или пропустите голос.", "Choose another active player or skip.", "Басқа белсенді ойыншыны таңда немесе дауыс беруді өткізіп жібер."],
  ["Вы уже проголосовали.", "You have already voted.", "Сен дауыс беріп қойдың."],
  ["Дождитесь голосов всех игроков.", "Wait for everyone to vote.", "Барлық ойыншылардың дауысын күт."],
  ["Сначала завершите ассоциации.", "Finish the clues before ending the round.", "Алдымен ассоциацияларды аяқтаңдар."],
  ["Только пойманный шпион может дать один ответ.", "Only the caught spy can guess once.", "Тек ұсталған тыңшы бір рет жауап бере алады."],
  ["Дождитесь ответа шпиона.", "Wait for the spy to guess.", "Тыңшының жауабын күт."],
  ["Подтвердите, верен ли ответ.", "Confirm whether the guess is correct.", "Жауаптың дұрыстығын раста."],

  ['Запрос с другого сайта запрещён.', 'Requests from another site are not allowed.', 'Басқа сайттан сұрау жіберуге болмайды.'],
  ['Запрос слишком большой.', 'The request is too large.', 'Сұрау тым үлкен.'],
  ['Неверный формат запроса.', 'Invalid request format.', 'Сұрау пішімі қате.'],
  ['Не удалось создать комнату. Попробуйте ещё раз.', 'Could not create the room. Try again.', 'Бөлме ашылмады. Қайта байқап көр.'],
  ['Комната не найдена.', 'Room not found.', 'Бөлме табылмады.'],
  ['Метод не поддерживается.', 'This request method is not supported.', 'Бұл сұрау әдісі қолдау таппайды.'],
  ['Комната не найдена или срок её хранения истёк.', 'The room was not found or has expired.', 'Бөлме табылмады немесе сақтау мерзімі аяқталды.'],
  ['Комната занята. Повторите действие через секунду.', 'The room is busy. Try again in a moment.', 'Бөлме бос емес. Сәлден соң қайтала.'],
  ['Не удалось выполнить запрос. Попробуйте ещё раз.', 'The request failed. Try again.', 'Сұрау орындалмады. Қайта байқап көр.'],
  ['Хранилище комнат ещё не подключено.', 'Room storage is not connected yet.', 'Бөлмелер қоймасы әлі қосылмаған.'],
  ['В комнате уже больше игроков.', 'The room already has more players than that.', 'Бөлмедегі ойыншылар саны бұдан көп.'],
  ['До 1000 своих слов, каждое до 60 символов.', 'Use up to 1,000 custom words, each up to 60 characters.', '1000 сөзге дейін енгізуге болады. Әр сөзде ең көбі 60 таңба.'],
  ['Добавьте свои слова или включите встроенный словарь.', 'Add custom words or enable the built-in dictionary.', 'Өз сөздеріңді қос немесе кіріктірілген сөздікті қос.'],
  ['Имя должно содержать от 1 до 24 символов.', 'Your name must contain 1 to 24 characters.', 'Атыңда 1–24 таңба болуы керек.'],
  ['Комната заполнена. Попросите ведущего увеличить размер.', 'The room is full. Ask the host to increase its capacity.', 'Бөлме толы. Жүргізушіден орын санын көбейтуді сұра.'],
  ['Вы вышли из комнаты. Войдите снова.', 'Your session ended. Join the room again.', 'Сеансың аяқталды. Бөлмеге қайта кір.'],
  ['Это действие доступно ведущему.', 'Only the host can do that.', 'Бұл әрекетті тек жүргізуші орындай алады.'],
  ['Этот ход уже сменился. Дождитесь обновления экрана.', 'This turn has changed. Wait for the screen to update.', 'Бұл жүріс өзгерді. Экранның жаңаруын күт.'],
  ['Игра уже началась.', 'The game has already started.', 'Ойын басталып кетті.'],
  ['Настройки доступны в лобби.', 'Settings can only be changed in the lobby.', 'Баптауларды тек күту бөлмесінде өзгертуге болады.'],
  ['Для игры нужны хотя бы 3 игрока.', 'At least 3 players are required.', 'Ойынға кемінде 3 ойыншы керек.'],
  ['Сменить слово можно только до установки мин.', 'You can only change the word before mines are planted.', 'Сөзді мина қойылғанға дейін ғана ауыстыруға болады.'],
  ['Сменить слово может только объясняющий.', 'Only the explainer can change the word.', 'Сөзді тек түсіндіруші ауыстыра алады.'],
  ['Первая мина уже установлена. Сменить слово нельзя.', 'The first mine is planted. The word cannot be changed.', 'Алғашқы мина қойылды. Сөзді ауыстыруға болмайды.'],
  ['В словаре нет другого слова.', 'There are no other words in the dictionary.', 'Сөздікте басқа сөз жоқ.'],
  ['Минирование уже завершено.', 'The mine-planting phase has ended.', 'Мина қою кезеңі аяқталды.'],
  ['Мины устанавливают только минёры.', 'Only miners can plant mines.', 'Минаны тек мина қоюшылар қоя алады.'],
  ['Мина — от 1 до 20 символов, включая пробелы.', 'A mine must have 1 to 20 characters, including spaces.', 'Мина бос орындармен қоса 1–20 таңбадан тұруы керек.'],
  ['Секретное слово не может быть миной.', 'The secret word cannot be used as a mine.', 'Құпия сөзді мина ретінде қолдануға болмайды.'],
  ['Сейчас нельзя отправить ответ.', 'You cannot submit an answer right now.', 'Қазір жауап жіберуге болмайды.'],
  ['Ответ отправляет угадывающий.', 'Only the guesser can submit an answer.', 'Жауапты тек сөз табушы жібере алады.'],
  ['Введите ответ до 60 символов.', 'Enter an answer of up to 60 characters.', 'Ең көбі 60 таңбадан тұратын жауап енгіз.'],
  ['Ход уже завершён.', 'This turn has already ended.', 'Бұл жүріс аяқталды.'],
  ['Подтвердить ответ может объясняющий или ведущий.', 'Only the explainer or host can confirm an answer.', 'Жауапты тек түсіндіруші немесе жүргізуші растай алады.'],
  ['Сейчас нельзя сообщить о мине.', 'You cannot report a mine right now.', 'Қазір мина туралы хабарлауға болмайды.'],
  ['Можно заявить только о своей мине.', 'You can only report your own mine.', 'Тек өз минаң туралы хабарлай аласың.'],
  ['Нет заявки на подрыв.', 'There is no mine report to review.', 'Тексеруге арналған мина хабарламасы жоқ.'],
  ['Нет активного хода.', 'There is no active turn.', 'Белсенді жүріс жоқ.'],
  ['Сначала завершите ход.', 'Finish the current turn first.', 'Алдымен қазіргі жүрісті аяқта.'],
  ['Вы уже в лобби.', 'You are already in the lobby.', 'Сен күту бөлмесіндесің.'],
  ['Для выхода используйте кнопку «Выйти».', 'Use the Leave button to leave the room.', 'Шығу үшін «Шығу» батырмасын қолдан.'],
  ['Игрок не найден.', 'Player not found.', 'Ойыншы табылмады.'],
  ['Неизвестное действие.', 'Unknown action.', 'Белгісіз әрекет.'],
  ['Неизвестный язык словаря.', 'Unsupported word language.', 'Сөздік тілі қолдау таппайды.'],
  ['Число игроков: от 3 до 1000000.', 'Players: from 3 to 1,000,000.', 'Ойыншылар саны: 3–1 000 000.'],
  ['Количество кругов: от 1 до 20.', 'Cycles: from 1 to 20.', 'Айналым саны: 1–20.']
];
export function translateError(message) {
  const row = errorMessages.find(([ru]) => ru === message);
  return row ? row[{ru:0,en:1,kk:2}[language]] : (language === 'ru' && message ? message : t('requestFailed'));
}
