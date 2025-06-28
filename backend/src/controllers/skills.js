import { firestore } from '../lib/firebaseAdmin.js';
import admin from 'firebase-admin';

const SKILLS_COLLECTION = 'skills';

export const createSkill = async (req, res) => {
  try {
    const { title, description, tags, level } = req.body;
    const skillData = {
      title,
      description,
      tags,
      level,
      owner: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await firestore.collection(SKILLS_COLLECTION).add(skillData);
    const skill = { id: docRef.id, ...skillData };
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    console.log('getSkills called, user:', req.user);
    const { search, level, tags } = req.query;
    // Start with filtering by owner (required for data isolation)
    let query = firestore.collection(SKILLS_COLLECTION).where('owner', '==', req.user.uid);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let skills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Apply additional filters in memory to avoid composite index issues
    if (level) {
      skills = skills.filter(skill => skill.level === level);
    }
    
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      skills = skills.filter(skill => 
        skill.tags && tagsArray.some(tag => skill.tags.includes(tag))
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      skills = skills.filter(
        (skill) =>
          skill.title.toLowerCase().includes(searchLower) ||
          skill.description.toLowerCase().includes(searchLower) ||
          (skill.tags &&
            skill.tags.join(' ').toLowerCase().includes(searchLower))
      );
    }

    console.log('Returning skills:', skills);
    res.json(skills);
  } catch (error) {
    console.error('Error in getSkills:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getSkill = async (req, res) => {
  try {
    const doc = await firestore
      .collection(SKILLS_COLLECTION)
      .doc(req.params.id)
      .get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { title, description, tags, level } = req.body;
    const docRef = firestore.collection(SKILLS_COLLECTION).doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const skill = doc.data();
    if (skill.owner !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedData = {
      title: title || skill.title,
      description: description || skill.description,
      tags: tags || skill.tags,
      level: level || skill.level,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.update(updatedData);
    res.json({ id: doc.id, ...updatedData, owner: skill.owner });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const docRef = firestore.collection(SKILLS_COLLECTION).doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const skill = doc.data();
    if (skill.owner !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await docRef.delete();
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const browseSkills = async (req, res) => {
  try {
    const snapshot = await firestore.collection(SKILLS_COLLECTION).orderBy('createdAt', 'desc').get();
    let skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Exclude current user's skills
    skills = skills.filter(skill => skill.owner !== req.user.uid);
    res.json(skills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
