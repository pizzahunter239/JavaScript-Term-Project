namespace AnimalMatchingGame
{
    public partial class MainPage : ContentPage
    {
        int matchesFound = 0;
        int tenthsOfSecondsElapsed = 0;
        Button lastClicked;

        List<string> animalEmoji = new List<string>()
        {
            "🐶", "🐶",
            "🐺", "🐺",
            "🐮", "🐮",
            "🦊", "🦊",
            "🐱", "🐱",
            "🦁", "🦁",
            "🐯", "🐯",
            "🐹", "🐹",
        };

        public MainPage()
        {
            InitializeComponent();
        }

        private void PlayAgainButton_Clicked(object sender, EventArgs e)
        {
            // Reset the game state
            matchesFound = 0;
            lastClicked = null;

            // Make all animal buttons visible and hide the play again button
            foreach (var button in AnimalButtons.Children.OfType<Button>())
            {
                if (button != PlayAgainButton)
                {
                    button.IsVisible = true;
                }
            }
            PlayAgainButton.IsVisible = false;

            // Shuffle and assign animals to buttons
            foreach (var button in AnimalButtons.Children.OfType<Button>())
            {
                if (button != PlayAgainButton)
                {
                    int index = Random.Shared.Next(animalEmoji.Count);
                    string nextEmoji = animalEmoji[index];
                    button.Text = nextEmoji;
                    animalEmoji.RemoveAt(index);
                }
            }

            // Restore the animal emoji list for next game
            animalEmoji = new List<string>()
            {
                "🐶", "🐶",
                "🐺", "🐺",
                "🐮", "🐮",
                "🦊", "🦊",
                "🐱", "🐱",
                "🦁", "🦁",
                "🐯", "🐯",
                "🐹", "🐹",
            };

            // Start the timer
            Dispatcher.StartTimer(TimeSpan.FromSeconds(.1), TimerTick);
        }

        private void Button_Clicked(object sender, EventArgs e)
        {
            Button buttonClicked = sender as Button;

            // Don't process clicks on empty buttons or the play again button
            if (buttonClicked == PlayAgainButton || string.IsNullOrEmpty(buttonClicked.Text))
                return;

            if (lastClicked == null)
            {
                // This is the first button in a potential pair
                lastClicked = buttonClicked;
                return;
            }

            // Check if we have a match
            if ((buttonClicked != lastClicked) && (buttonClicked.Text == lastClicked.Text)
                && (buttonClicked.Text != ""))
            {
                // We found a match!
                matchesFound++;
                lastClicked.Text = "";
                buttonClicked.Text = "";
            }

            // Reset for the next pair
            lastClicked = null;

            // Check if the game is over (all 8 pairs found)
            if (matchesFound == 8)
            {
                // Hide all animal buttons and show play again button
                foreach (var button in AnimalButtons.Children.OfType<Button>())
                {
                    if (button != PlayAgainButton)
                    {
                        button.IsVisible = false;
                    }
                }
                PlayAgainButton.IsVisible = true;
            }
        }

        private bool TimerTick()
        {
            // Use MainThread.BeginInvokeOnMainThread to ensure UI updates happen on the main thread
            MainThread.BeginInvokeOnMainThread(() =>
            {
                if (this.IsLoaded)
                {
                    tenthsOfSecondsElapsed++;
                    TimeElapsed.Text = "Time elapsed: " +
                        (tenthsOfSecondsElapsed / 10F).ToString("0.0s");
                }
            });

            if (PlayAgainButton.IsVisible)
            {
                tenthsOfSecondsElapsed = 0;
                return false;
            }

            return true;
        }
    }
}