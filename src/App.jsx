
import { useState } from "react";
import "./App.css";

const sampleEvents = [
  {
    id: 1,
    title: "AI & Innovation Symposium",
    category: "Symposium",
    date: "2026-11-15",
    time: "10:00 AM",
    venue: "Main Auditorium",
    description:
      "Explore artificial intelligence, innovative projects, and emerging technologies.",
  },
  {
    id: 2,
    title: "Campus Cultural Fest",
    category: "Culturals",
    date: "2026-11-22",
    time: "9:30 AM",
    venue: "College Grounds",
    description:
      "Celebrate music, dance, creativity, and student talent.",
  },
  {
    id: 3,
    title: "Web Development Workshop",
    category: "Workshops",
    date: "2026-09-20",
    time: "2:00 PM",
    venue: "Computer Lab",
    description:
      "A hands-on workshop introducing modern web development.",
  },
  {
    id: 4,
    title: "Project Expo",
    category: "Technical Events",
    date: "2026-12-05",
    time: "11:00 AM",
    venue: "Seminar Hall",
    description:
      "Showcase student projects, prototypes, and creative solutions.",
  },
];

const eventCategories = [
  "Culturals",
  "Sports",
  "Symposium",
  "Technical Events",
  "Workshops",
  "Others",
];

const REVIEW_STORAGE_KEY = "miraEventsReviews";

function loadSavedReviews() {
  try {
    const saved = localStorage.getItem(REVIEW_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function App() {
  const [page, setPage] = useState("home");
  const [role, setRole] = useState("student");
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [history, setHistory] = useState([]);

  // Current demo account
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Event state
  const [events, setEvents] = useState(sampleEvents);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Feedback state
  const [reviews, setReviews] = useState(loadSavedReviews);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "",
    date: "",
    time: "",
    venue: "",
    description: "",
  });

  const emptyForm = {
    fullName: "",
    email: "",
    phone: "",
    club: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  };

  const [form, setForm] = useState(emptyForm);

  const isOrganizer = role === "organizer";

  const today = new Date().toISOString().slice(0, 10);

  const upcomingEvents = events.filter(
    (event) => event.date >= today
  );

  const previousEvents = events.filter(
    (event) => event.date < today
  );

  // Get all feedback submitted for a particular event.
  function getEventReviews(eventId) {
    return reviews.filter(
      (review) => String(review.eventId) === String(eventId)
    );
  }

  // Calculate an event's average rating.
  function getAverageRating(eventId) {
    const eventReviews = getEventReviews(eventId);

    if (eventReviews.length === 0) {
      return null;
    }

    const total = eventReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return (total / eventReviews.length).toFixed(1);
  }

  // Find the current student's feedback for an event.
  function getMyReview(eventId) {
    if (!currentUserEmail) {
      return null;
    }

    return reviews.find(
      (review) =>
        String(review.eventId) === String(eventId) &&
        review.studentEmail === currentUserEmail
    );
  }

  function navigate(nextPage) {
    setHistory((previous) => [...previous, page]);
    setPage(nextPage);
    setMessage("");
    setFeedbackMessage("");
  }

  function goBack() {
    if (history.length === 0) {
      goHome();
      return;
    }

    setPage(history[history.length - 1]);
    setHistory((previous) => previous.slice(0, -1));
    setMessage("");
    setFeedbackMessage("");
  }

  function goHome() {
    setPage("home");
    setHistory([]);
    setMessage("");
    setFeedbackMessage("");
    setSelectedEvent(null);
    setSelectedCategory("");
    setShowUploadForm(false);
    setShowPassword(false);
    setSelectedRating(0);
    setFeedbackText("");
    setCurrentUserEmail("");
    setRole("student");
    setForm({ ...emptyForm });
  }

  function openAuth(nextRole) {
    setRole(nextRole);
    setAuthMode("login");
    setForm({ ...emptyForm });
    setMessage("");
    setFeedbackMessage("");
    setShowPassword(false);
    setSelectedCategory("");
    setShowUploadForm(false);
    setSelectedRating(0);
    setFeedbackText("");
    setCurrentUserEmail("");
    setHistory(["home"]);
    setPage(nextRole);
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function changeMode(mode) {
    setAuthMode(mode);
    setMessage("");
    setShowPassword(false);
    setForm({ ...emptyForm });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (authMode === "register") {
      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match. Please try again.");
        return;
      }
    }

    // Demo only: real authentication is not connected yet.
    setCurrentUserEmail(form.email.trim().toLowerCase());
    setHistory(["home"]);
    setPage("dashboard");
  }

  function updateNewEvent(event) {
    const { name, value } = event.target;

    setNewEvent((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function addUpcomingEvent(event) {
    event.preventDefault();
    setMessage("");

    if (newEvent.date < today) {
      setMessage("Please choose today or a future date.");
      return;
    }

    setEvents((previous) => [
      ...previous,
      {
        ...newEvent,
        id: Date.now(),
      },
    ]);

    setNewEvent({
      title: "",
      category: "",
      date: "",
      time: "",
      venue: "",
      description: "",
    });

    setShowUploadForm(false);
    setMessage("Event added successfully!");
  }

  // Open an event and load the student's existing feedback, if any.
  function openEventDetails(event) {
    setSelectedEvent(event);

    const existingReview = getMyReview(event.id);

    setSelectedRating(existingReview?.rating || 0);
    setFeedbackText(existingReview?.comment || "");
    setFeedbackMessage("");

    navigate("eventDetails");
  }

  // Students can submit or update their own feedback.
  // Organizers are blocked from this action in the frontend.
  function submitFeedback(event) {
    event.preventDefault();
    setFeedbackMessage("");

    if (isOrganizer) {
      setFeedbackMessage(
        "Organizer accounts can view feedback but cannot submit or edit it."
      );
      return;
    }

    if (!currentUserEmail) {
      setFeedbackMessage(
        "Please log in with your student account to submit feedback."
      );
      return;
    }

    if (!selectedRating) {
      setFeedbackMessage("Please select a star rating.");
      return;
    }

    if (!feedbackText.trim()) {
      setFeedbackMessage("Please enter your feedback.");
      return;
    }

    const existingReview = getMyReview(selectedEvent.id);

    const newReview = {
      eventId: selectedEvent.id,
      studentEmail: currentUserEmail,
      rating: selectedRating,
      comment: feedbackText.trim(),
      updatedAt: new Date().toISOString(),
    };

    let updatedReviews;

    if (existingReview) {
      // One review per student per event.
      updatedReviews = reviews.map((review) =>
        String(review.eventId) === String(selectedEvent.id) &&
        review.studentEmail === currentUserEmail
          ? newReview
          : review
      );
    } else {
      updatedReviews = [...reviews, newReview];
    }

    setReviews(updatedReviews);

    try {
      localStorage.setItem(
        REVIEW_STORAGE_KEY,
        JSON.stringify(updatedReviews)
      );
    } catch {
      setFeedbackMessage(
        "Feedback was updated in this session, but browser storage is unavailable."
      );
      return;
    }

    setFeedbackMessage(
      existingReview
        ? "Your feedback has been updated successfully!"
        : "Thank you! Your feedback has been submitted."
    );
  }

  function BackButton() {
    return (
      <button
        type="button"
        className="home-link page-back-button"
        onClick={goBack}
      >
        ← Back
      </button>
    );
  }

  function RatingSummary({ eventId }) {
    const average = getAverageRating(eventId);
    const count = getEventReviews(eventId).length;

    return (
      <div className="rating-summary">
        <span aria-label={average ? `${average} out of 5 stars` : "Not rated yet"}>
          ⭐ {average || "Not rated yet"}
        </span>

        <span>
          {count} {count === 1 ? "rating" : "ratings"}
        </span>
      </div>
    );
  }

  function EventCard({ event }) {
    return (
      <article className="event-card">
        <span className="event-category">
          {event.category}
        </span>

        <h3>{event.title}</h3>
        <p>{event.description}</p>

        <div className="event-info">
          <span>📅 {event.date}</span>
          <span>🕒 {event.time}</span>
          <span>📍 {event.venue}</span>
        </div>

        <RatingSummary eventId={event.id} />

        <button
          type="button"
          className="auth-submit"
          onClick={() => openEventDetails(event)}
        >
          View Details & Feedback <span>→</span>
        </button>
      </article>
    );
  }

  function EventList({ title, events: listEvents }) {
    const organizerPrevious =
      isOrganizer && title === "Previous Events";

    const visibleEvents = organizerPrevious
      ? listEvents.filter(
          (event) => event.category === selectedCategory
        )
      : listEvents;

    const isOrganizerUpcoming =
      isOrganizer && title === "Upcoming Events";

    return (
      <main className="events-page">
        <BackButton />

        <section className="events-heading">
          <span className="auth-badge">MIRA EVENTS</span>

          <h1>{title}</h1>

          <p>
            {title === "Upcoming Events"
              ? "Discover what's happening next on your campus."
              : "Explore memories of events already held on campus."}
          </p>
        </section>

        {/* ORGANIZER: PREVIOUS EVENT CATEGORY FILTER */}
        {organizerPrevious && (
          <div className="form-group">
            <label htmlFor="previousCategory">
              Choose an event category
            </label>

            <select
              id="previousCategory"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              <option value="">Select a category</option>

              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ORGANIZER: UPCOMING EVENT UPLOAD */}
        {isOrganizerUpcoming && (
          <section>
            <button
              type="button"
              className="auth-submit"
              onClick={() => {
                setShowUploadForm((previous) => !previous);
                setMessage("");
              }}
            >
              {showUploadForm
                ? "Cancel Upload"
                : "+ Upload Event Details"}
            </button>

            {showUploadForm && (
              <form
                className="auth-form"
                onSubmit={addUpcomingEvent}
              >
                <div className="form-group">
                  <label htmlFor="eventTitle">Event name</label>

                  <input
                    id="eventTitle"
                    name="title"
                    value={newEvent.title}
                    onChange={updateNewEvent}
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventCategory">
                    Event category
                  </label>

                  <select
                    id="eventCategory"
                    name="category"
                    value={newEvent.category}
                    onChange={updateNewEvent}
                    required
                  >
                    <option value="">Select a category</option>

                    {eventCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="eventDate">Date</label>

                  <input
                    id="eventDate"
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={updateNewEvent}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventTime">Time</label>

                  <input
                    id="eventTime"
                    name="time"
                    value={newEvent.time}
                    onChange={updateNewEvent}
                    placeholder="e.g. 10:00 AM"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventVenue">Venue</label>

                  <input
                    id="eventVenue"
                    name="venue"
                    value={newEvent.venue}
                    onChange={updateNewEvent}
                    placeholder="Enter event venue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventDescription">
                    Description
                  </label>

                  <textarea
                    id="eventDescription"
                    name="description"
                    value={newEvent.description}
                    onChange={updateNewEvent}
                    placeholder="Enter event details"
                    rows={4}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit">
                  Add Upcoming Event <span>→</span>
                </button>
              </form>
            )}

            {message && (
              <div className="auth-message" role="status">
                {message}
              </div>
            )}
          </section>
        )}

        {/* PREVIOUS EVENTS: SELECT CATEGORY FIRST */}
        {organizerPrevious && !selectedCategory ? (
          <section className="empty-events">
            <div className="empty-events-icon">♡</div>
            <h2>Choose a category first</h2>
            <p>
              Select a category above to view previous events.
            </p>
          </section>
        ) : visibleEvents.length > 0 ? (
          <div className="events-grid">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <section className="empty-events">
            <div className="empty-events-icon">♡</div>
            <h2>No events available</h2>
            <p>
              {organizerPrevious
                ? "There are no previous events in this category."
                : "Check back later for campus updates."}
            </p>
          </section>
        )}
      </main>
    );
  }

  function EventFeedbackSection({ event }) {
    const eventReviews = getEventReviews(event.id);
    const myReview = getMyReview(event.id);

    return (
      <section className="feedback-section">
        <h2>Event Rating & Feedback</h2>

        <p className="feedback-intro">
          Share your experience and help improve future campus events.
        </p>

        <RatingSummary eventId={event.id} />

        {/* Only students can submit feedback. */}
        {!isOrganizer && (
          <form
            className="auth-form feedback-form"
            onSubmit={submitFeedback}
          >
            <div className="form-group">
              <label>Your rating</label>

              <div
                className="star-rating"
                role="group"
                aria-label="Choose a rating from 1 to 5 stars"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${
                      selectedRating >= star ? "selected" : ""
                    }`}
                    onClick={() => setSelectedRating(star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    aria-pressed={selectedRating === star}
                  >
                    ★
                  </button>
                ))}
              </div>

              <p className="rating-hint">
                {selectedRating
                  ? `You selected ${selectedRating} out of 5 stars.`
                  : "Select from 1 to 5 stars."}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="eventFeedback">
                Your feedback
              </label>

              <textarea
                id="eventFeedback"
                value={feedbackText}
                onChange={(event) =>
                  setFeedbackText(event.target.value)
                }
                placeholder="What did you like? What could be improved?"
                rows={4}
                maxLength={1000}
                required
              />

              <p className="rating-hint">
                {feedbackText.length}/1000 characters
              </p>
            </div>

            <button type="submit" className="auth-submit">
              {myReview ? "Update My Feedback" : "Submit Feedback"}
              <span>→</span>
            </button>

            {myReview && (
              <p className="rating-hint">
                You have already reviewed this event. You can update
                your own rating and feedback here.
              </p>
            )}

            {feedbackMessage && (
              <div className="auth-message" role="status">
                {feedbackMessage}
              </div>
            )}
          </form>
        )}

        {isOrganizer && (
          <p className="organizer-readonly-note">
            Organizer view: ratings and feedback are read-only.
          </p>
        )}

        <div className="submitted-feedback">
          <h3>Student Feedback</h3>

          {eventReviews.length === 0 ? (
            <p className="empty-feedback">
              No feedback has been submitted for this event yet.
            </p>
          ) : (
            eventReviews.map((review, index) => (
              <article
                className="feedback-item"
                key={`${review.eventId}-${review.studentEmail}-${index}`}
              >
                <div className="feedback-item-heading">
                  <strong>Student review</strong>
                  <span>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <p>{review.comment}</p>

                <small>
                  {review.updatedAt
                    ? new Date(review.updatedAt).toLocaleDateString()
                    : ""}
                </small>
              </article>
            ))
          )}
        </div>
      </section>
    );
  }

  if (page === "student" || page === "organizer") {
    return (
      <div className="app">
        <header className="navbar">
          <button
            className="brand brand-button"
            type="button"
            onClick={goHome}
          >
            <span className="brand-icon">M</span>
            <span>Mira Events</span>
          </button>

          <button className="home-link" onClick={goHome}>
            ← Back to Home
          </button>
        </header>

        <main className="auth-page">
          <section className="auth-intro">
            <span className="auth-badge">
              {isOrganizer ? "ORGANIZER PORTAL" : "STUDENT PORTAL"}
            </span>

            <h1>
              {isOrganizer ? (
                <>
                  Bring your campus
                  <br />
                  events to <span>life.</span>
                </>
              ) : (
                <>
                  Your campus.
                  <br />
                  Your <span>moments.</span>
                </>
              )}
            </h1>

            <p>
              {isOrganizer
                ? "Manage your club events, bring students together, and make every campus moment count."
                : "Discover exciting campus events, connect with clubs, and never miss a moment worth remembering."}
            </p>

            <div className="auth-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                {isOrganizer
                  ? "Create and manage events"
                  : "Discover campus events"}
              </div>

              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                {isOrganizer
                  ? "Connect with participants"
                  : "Register for events"}
              </div>

              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                {isOrganizer
                  ? "Organize campus activities"
                  : "Explore college clubs"}
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-heading">
              <div className="auth-symbol">
                {isOrganizer ? "✦" : "♡"}
              </div>

              <h2>
                {authMode === "login"
                  ? "Welcome back!"
                  : "Join Mira Events"}
              </h2>

              <p>
                {authMode === "login"
                  ? `Log in to your ${role} account.`
                  : `Create your ${role} account to get started.`}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => changeMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => changeMode("register")}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode === "register" && (
                <>
                  <div className="form-group">
                    <label htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={updateField}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={updateField}
                      autoComplete="tel"
                      pattern="[0-9+() -]{7,20}"
                      title="Enter a valid phone number."
                      required
                    />
                  </div>

                  {isOrganizer ? (
                    <div className="form-group">
                      <label htmlFor="club">Club / Department</label>
                      <input
                        id="club"
                        name="club"
                        type="text"
                        placeholder="e.g. AI & DS Club"
                        value={form.club}
                        onChange={updateField}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor="department">
                          Department
                        </label>
                        <input
                          id="department"
                          name="department"
                          type="text"
                          placeholder="e.g. Artificial Intelligence"
                          value={form.department}
                          onChange={updateField}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="year">Year of study</label>
                        <select
                          id="year"
                          name="year"
                          value={form.year}
                          onChange={updateField}
                          required
                        >
                          <option value="">Select your year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="form-group">
                <label htmlFor="email">College email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      authMode === "register"
                        ? "Create a password (8+ characters)"
                        : "Enter your password"
                    }
                    value={form.password}
                    onChange={updateField}
                    autoComplete={
                      authMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {authMode === "register" && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    value={form.confirmPassword}
                    onChange={updateField}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              )}

              {authMode === "login" && (
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() =>
                    setMessage(
                      "Password recovery will be available after backend integration."
                    )
                  }
                >
                  Forgot password?
                </button>
              )}

              {message && (
                <div className="auth-message" role="status">
                  {message}
                </div>
              )}

              <button type="submit" className="auth-submit">
                {authMode === "login"
                  ? "Login to your account"
                  : "Create account"}
                <span>→</span>
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "New to Mira Events?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  changeMode(
                    authMode === "login" ? "register" : "login"
                  )
                }
              >
                {authMode === "login" ? "Register here" : "Login here"}
              </button>
            </p>

            <p className="auth-security">
              <span>◇</span> Your campus community starts here.
            </p>
          </section>
        </main>

        <footer className="footer">
          <span>MIRA EVENTS</span>
          <span className="footer-dot">•</span>
          <span>CAMPUS EVENTS & CLUB BOARD</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <button
          className="brand brand-button"
          type="button"
          onClick={goHome}
        >
          <span className="brand-icon">M</span>
          <span>Mira Events</span>
        </button>

        {page !== "home" && (
          <button className="home-link" onClick={goHome}>
            Home
          </button>
        )}
      </header>

      {page === "home" && (
        <main className="hero">
          <div className="hero-badge">
            <span className="status-dot"></span>
            YOUR CAMPUS EVENT HUB
          </div>

          <div className="hero-content">
            <h1>
              Mira <span>Events</span>
            </h1>

            <p className="tagline">
              Start exploring all events here.
            </p>

            <p className="description">
              Discover campus events, connect with clubs,
              and be part of something exciting.
            </p>

            <div className="login-buttons">
              <button
                className="login-btn organizer-btn"
                onClick={() => openAuth("organizer")}
              >
                <span className="button-icon">✦</span>
                Organizer Login
                <span className="arrow">→</span>
              </button>

              <button
                className="login-btn participant-btn"
                onClick={() => openAuth("student")}
              >
                <span className="button-icon">♡</span>
                Student Login
                <span className="arrow">→</span>
              </button>
            </div>
          </div>

          <div className="hero-decoration decoration-one"></div>
          <div className="hero-decoration decoration-two"></div>
        </main>
      )}

      {page === "dashboard" && (
        <main className="events-page">
          <BackButton />

          <section className="events-heading">
            <span className="auth-badge">
              {isOrganizer ? "ORGANIZER PORTAL" : "STUDENT PORTAL"}
            </span>

            <h1>Welcome to Mira Events!</h1>
            <p>Where would you like to go today?</p>
          </section>

          <div className="choice-grid">
            <button
              type="button"
              className="choice-card"
              onClick={() => {
                setShowUploadForm(false);
                setMessage("");
                navigate("upcoming");
              }}
            >
              <span className="choice-icon">▣</span>
              <h2>Upcoming Events</h2>
              <p>Explore events that are coming soon.</p>
              <span className="choice-link">
                Explore Events →
              </span>
            </button>

            <button
              type="button"
              className="choice-card"
              onClick={() => {
                setSelectedCategory("");
                setMessage("");
                navigate("previous");
              }}
            >
              <span className="choice-icon">↺</span>
              <h2>Previous Events</h2>
              <p>Revisit events that have already happened.</p>
              <span className="choice-link">
                View History →
              </span>
            </button>
          </div>
        </main>
      )}

      {page === "upcoming" && (
        <EventList
          title="Upcoming Events"
          events={upcomingEvents}
        />
      )}

      {page === "previous" && (
        <EventList
          title="Previous Events"
          events={previousEvents}
        />
      )}

      {page === "eventDetails" && selectedEvent && (
        <main className="events-page">
          <BackButton />

          <article className="event-detail-card">
            <span className="event-category">
              {selectedEvent.category}
            </span>

            <h1>{selectedEvent.title}</h1>
            <p>{selectedEvent.description}</p>
            <p>📅 Date: {selectedEvent.date}</p>
            <p>🕒 Time: {selectedEvent.time}</p>
            <p>📍 Venue: {selectedEvent.venue}</p>

            <RatingSummary eventId={selectedEvent.id} />
          </article>

          <EventFeedbackSection event={selectedEvent} />
        </main>
      )}

      <footer className="footer">
        <span>MIRA EVENTS</span>
        <span className="footer-dot">•</span>
        <span>CAMPUS EVENTS & CLUB BOARD</span>
      </footer>
    </div>
  );
}

export default App;
