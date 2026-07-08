import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Course, Lecture } from "./types";
import { coursesData } from "./data";

const COURSES_COLLECTION = "courses";

/**
 * Clean any undefined properties recursively to prevent Firestore write errors.
 */
function cleanUndefined<T>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as any;
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      cleaned[key] = cleanUndefined(val);
    }
  }
  return cleaned;
}

/**
 * Real-time listener for the courses collection in Firestore.
 * Clean, real-time database subscription with no unrequested mock seeding.
 */
export function subscribeCourses(onUpdate: (courses: Course[]) => void) {
  const collRef = collection(db, COURSES_COLLECTION);
  
  return onSnapshot(collRef, (snapshot) => {
    if (snapshot.empty) {
      console.log("No courses found in Firestore. Maintaining pristine anatomy archives.");
      onUpdate([]);
    } else {
      const coursesList: Course[] = [];
      snapshot.forEach((docSnap) => {
        coursesList.push(docSnap.data() as Course);
      });
      
      // Sort to preserve consistent order (e.g., course-1, course-2, course-3)
      coursesList.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(coursesList);
    }
  }, (error) => {
    console.error("Firestore subscription error: ", error);
  });
}

/**
 * Add an entire course folder dynamically to Firestore.
 */
export async function addCourseToDb(newCourse: Course) {
  const docRef = doc(db, COURSES_COLLECTION, newCourse.id);
  await setDoc(docRef, cleanUndefined(newCourse));
}

/**
 * Delete an entire course folder from Firestore.
 */
export async function deleteCourseFromDb(courseId: string) {
  const docRef = doc(db, COURSES_COLLECTION, courseId);
  await deleteDoc(docRef);
}

/**
 * Seed initial courses into Firestore from static data.
 * Keeps this helper function available but NOT triggered automatically on empty snapshot.
 */
export async function seedInitialCourses() {
  const batch = writeBatch(db);
  for (const course of coursesData) {
    const docRef = doc(db, COURSES_COLLECTION, course.id);
    batch.set(docRef, cleanUndefined(course));
  }
  await batch.commit();
  console.log("Firestore database successfully seeded!");
}

/**
 * Add a lecture securely to a course document in Firestore.
 */
export async function addLectureToCourse(courseId: string, newLecture: Lecture) {
  const docRef = doc(db, COURSES_COLLECTION, courseId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const targetCourse = docSnap.data() as Course;
    const sanitizedLecture = cleanUndefined(newLecture);
    const updatedLectures = [...(targetCourse.lectures || []), sanitizedLecture];
    await updateDoc(docRef, {
      lectures: updatedLectures,
      lecturesCount: updatedLectures.length
    });
  }
}

/**
 * Remove a lecture from a course document in Firestore.
 */
export async function deleteLectureFromCourse(courseId: string, lectureId: string) {
  const docRef = doc(db, COURSES_COLLECTION, courseId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const targetCourse = docSnap.data() as Course;
    const updatedLectures = (targetCourse.lectures || []).filter(l => l.id !== lectureId);
    await updateDoc(docRef, {
      lectures: cleanUndefined(updatedLectures),
      lecturesCount: updatedLectures.length
    });
  }
}

/**
 * Update the lectures list for a specific course directly in Firestore.
 */
export async function updateCourseLectures(courseId: string, updatedLectures: Lecture[]) {
  const docRef = doc(db, COURSES_COLLECTION, courseId);
  await updateDoc(docRef, {
    lectures: cleanUndefined(updatedLectures),
    lecturesCount: updatedLectures.length
  });
}

/**
 * Add a user inquiry/contact query dynamically to Firestore with mobile and unread by default.
 */
export async function addContactToDb(contact: { 
  id: string; 
  name: string; 
  email: string; 
  mobile: string;
  subject: string; 
  message: string; 
  timestamp: string;
  read?: boolean;
}) {
  const collRef = collection(db, "contacts");
  const docRef = doc(collRef, contact.id);
  await setDoc(docRef, {
    ...contact,
    read: contact.read ?? false
  });
}

/**
 * Update the read status of a contact inquiry message.
 */
export async function updateContactReadStatus(id: string, read: boolean) {
  const docRef = doc(db, "contacts", id);
  await updateDoc(docRef, { read });
}

/**
 * Real-time listener for the contacts collection in Firestore.
 */
export function subscribeContacts(onUpdate: (contacts: any[]) => void) {
  const collRef = collection(db, "contacts");
  return onSnapshot(collRef, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    onUpdate(list);
  }, (error) => {
    console.error("Firestore contact subscription error: ", error);
  });
}

/**
 * Delete a contact message from Firestore.
 */
export async function deleteContactFromDb(id: string) {
  const docRef = doc(db, "contacts", id);
  await deleteDoc(docRef);
}

/**
 * Retrieve the current list of authorized administrator emails on demand.
 */
export async function getAdminEmails(): Promise<string[]> {
  const docRef = doc(db, "config", "admins");
  const docSnap = await getDoc(docRef);
  let list = ["adityaofficial9918@gmail.com"];
  if (docSnap.exists()) {
    const data = docSnap.data();
    list = data?.emails || list;
  } else {
    // Initialize config if it doesn't exist yet
    await setDoc(docRef, { emails: list });
  }
  // Ensure default admin is in list
  if (!list.includes("adityaofficial9918@gmail.com")) {
    list.unshift("adityaofficial9918@gmail.com");
  }
  return list.map(e => e.trim().toLowerCase());
}

/**
 * Real-time listener for authorized administrator emails.
 */
export function subscribeAdmins(onUpdate: (emails: string[]) => void) {
  const docRef = doc(db, "config", "admins");
  return onSnapshot(docRef, async (snapshot) => {
    if (!snapshot.exists()) {
      const defaultAdmins = ["adityaofficial9918@gmail.com"];
      await setDoc(docRef, { emails: defaultAdmins });
      onUpdate(defaultAdmins);
    } else {
      const data = snapshot.data();
      const list = data?.emails || ["adityaofficial9918@gmail.com"];
      if (!list.includes("adityaofficial9918@gmail.com")) {
        list.unshift("adityaofficial9918@gmail.com");
      }
      onUpdate(list);
    }
  }, (error) => {
    console.error("Firestore admins subscription error: ", error);
  });
}

/**
 * Add an administrator email to the configuration document.
 */
export async function addAdminEmail(email: string) {
  const docRef = doc(db, "config", "admins");
  const docSnap = await getDoc(docRef);
  let emails = ["adityaofficial9918@gmail.com"];
  if (docSnap.exists()) {
    const data = docSnap.data();
    emails = data?.emails || emails;
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail && !emails.includes(cleanEmail)) {
    emails.push(cleanEmail);
    await setDoc(docRef, { emails });
  }
}

/**
 * Remove an administrator email from the configuration document.
 * The primary admin email cannot be removed.
 */
export async function removeAdminEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === "adityaofficial9918@gmail.com") {
    throw new Error("The primary administrator cannot be removed.");
  }
  const docRef = doc(db, "config", "admins");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const emails: string[] = data?.emails || [];
    const updated = emails.filter(e => e.toLowerCase() !== cleanEmail);
    await setDoc(docRef, { emails: updated });
  }
}

/**
 * Real-time listener for the registered users collection in Firestore.
 */
export function subscribeUsers(onUpdate: (users: any[]) => void) {
  const collRef = collection(db, "users");
  return onSnapshot(collRef, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        uid: docSnap.id,
        ...docSnap.data()
      });
    });
    // Sort alphabetically by name
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    onUpdate(list);
  }, (error) => {
    console.error("Firestore user directory subscription error: ", error);
  });
}

/**
 * Update a user's role directly in their profile document.
 * Protects the primary administrator's role from accidental or malicious modification.
 */
export async function updateUserRole(userId: string, email: string | null, newRole: "student" | "admin") {
  if (email && email.trim().toLowerCase() === "adityaofficial9918@gmail.com") {
    throw new Error("The primary administrator's role is permanent and cannot be modified.");
  }
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    role: newRole
  });

  // Keep authorized administrator list in sync
  if (email) {
    if (newRole === "admin") {
      await addAdminEmail(email);
    } else {
      try {
        await removeAdminEmail(email);
      } catch (err) {
        console.warn("Could not remove primary administrator or find config:", err);
      }
    }
  }
}

/**
 * Fetch the active Admin Passcode configuration. If it doesn't exist, initializes a robust default.
 */
export async function getAdminPasscode(): Promise<string> {
  const docRef = doc(db, "config", "settings");
  const docSnap = await getDoc(docRef);
  const defaultPasscode = "KRISHNA-ANATOMY-ADMIN-2026";
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data?.adminPasscode || defaultPasscode;
  } else {
    await setDoc(docRef, { adminPasscode: defaultPasscode });
    return defaultPasscode;
  }
}

/**
 * Update the active Admin Passcode to a custom value.
 */
export async function updateAdminPasscode(newPasscode: string): Promise<void> {
  if (!newPasscode.trim()) {
    throw new Error("Passcode cannot be empty.");
  }
  const docRef = doc(db, "config", "settings");
  await setDoc(docRef, { adminPasscode: newPasscode.trim() }, { merge: true });
}

/**
 * Delete a user profile from the registered users collection in Firestore.
 */
export async function deleteUserFromDb(userId: string) {
  const docRef = doc(db, "users", userId);
  await deleteDoc(docRef);
}

/**
 * Remove a specific resource file attachment from a lecture inside a course document in Firestore.
 */
export async function deleteResourceFromLecture(courseId: string, lectureId: string, resourceName: string) {
  const docRef = doc(db, COURSES_COLLECTION, courseId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const targetCourse = docSnap.data() as Course;
    const updatedLectures = (targetCourse.lectures || []).map((lec) => {
      if (lec.id === lectureId) {
        const updatedResources = (lec.resources || []).filter((r) => r.name !== resourceName);
        return {
          ...lec,
          resources: updatedResources
        };
      }
      return lec;
    });

    await updateDoc(docRef, {
      lectures: cleanUndefined(updatedLectures)
    });
  }
}



