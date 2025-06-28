import { firestore } from '../lib/firebaseAdmin.js';
import admin from 'firebase-admin';

const EXCHANGES_COLLECTION = 'exchanges';
const SKILLS_COLLECTION = 'skills';

export const createExchange = async (req, res) => {
  try {
    const { skillId } = req.body;
    // Get the skill
    const skillDoc = await firestore
      .collection(SKILLS_COLLECTION)
      .doc(skillId)
      .get();
    if (!skillDoc.exists) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const skill = skillDoc.data();
    // Check if user is not the skill owner
    if (skill.owner === req.user.uid) {
      return res.status(400).json({ message: 'Cannot request your own skill' });
    }
    // Check if there's already a pending or active exchange
    const existingQuery = await firestore
      .collection(EXCHANGES_COLLECTION)
      .where('skill', '==', skillId)
      .where('student', '==', req.user.uid)
      .where('status', 'in', ['pending', 'active'])
      .get();
    if (!existingQuery.empty) {
      return res
        .status(400)
        .json({ message: 'You already have an active exchange request' });
    }
    // Create the exchange
    const exchangeData = {
      skill: skillId,
      teacher: skill.owner,
      student: req.user.uid,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await firestore
      .collection(EXCHANGES_COLLECTION)
      .add(exchangeData);
    res.status(201).json({ id: docRef.id, ...exchangeData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getExchanges = async (req, res) => {
  try {
    console.log('getExchanges called, user:', req.user);
    const { status } = req.query;
    // Outgoing requests (user is student)
    let studentQuery = firestore
      .collection(EXCHANGES_COLLECTION)
      .where('student', '==', req.user.uid);
    if (status) {
      studentQuery = studentQuery.where('status', '==', status);
    }
    const studentSnapshot = await studentQuery.orderBy('createdAt', 'desc').get();
    // Incoming requests (user is teacher)
    let teacherQuery = firestore
      .collection(EXCHANGES_COLLECTION)
      .where('teacher', '==', req.user.uid);
    if (status) {
      teacherQuery = teacherQuery.where('status', '==', status);
    }
    const teacherSnapshot = await teacherQuery.orderBy('createdAt', 'desc').get();
    // Combine and populate skill info
    const allDocs = [...studentSnapshot.docs, ...teacherSnapshot.docs];
    console.log('Found exchange docs:', allDocs.length);
    const exchanges = await Promise.all(
      allDocs.map(async (doc) => {
        const data = doc.data();
        let skillData = null;
        try {
          const skillDoc = await firestore.collection(SKILLS_COLLECTION).doc(data.skill).get();
          if (skillDoc.exists) {
            skillData = { id: skillDoc.id, ...skillDoc.data() };
          }
        } catch (e) {
          console.error('Error fetching skill for exchange', doc.id, e);
        }
        return {
          id: doc.id,
          ...data,
          skill: skillData,
        };
      })
    );
    res.json(exchanges);
  } catch (error) {
    console.error('Error in getExchanges:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getExchange = async (req, res) => {
  try {
    const doc = await firestore
      .collection(EXCHANGES_COLLECTION)
      .doc(req.params.id)
      .get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Exchange not found' });
    }
    const exchange = doc.data();
    // Check if user is part of the exchange
    if (
      exchange.teacher !== req.user.uid &&
      exchange.student !== req.user.uid
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ id: doc.id, ...exchange });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateExchangeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const docRef = firestore
      .collection(EXCHANGES_COLLECTION)
      .doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Exchange not found' });
    }
    const exchange = doc.data();
    // Check if user is the teacher
    if (exchange.teacher !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updateData = { status };
    if (status === 'active') {
      updateData.startTime = admin.firestore.FieldValue.serverTimestamp();
    } else if (status === 'completed') {
      updateData.endTime = admin.firestore.FieldValue.serverTimestamp();
    }
    await docRef.update(updateData);
    res.json({ id: doc.id, ...exchange, ...updateData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const rateExchange = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const docRef = firestore
      .collection(EXCHANGES_COLLECTION)
      .doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Exchange not found' });
    }
    const exchange = doc.data();
    // Check if user is the student
    if (exchange.student !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Check if exchange is completed
    if (exchange.status !== 'completed') {
      return res
        .status(400)
        .json({ message: 'Can only rate completed exchanges' });
    }
    await docRef.update({ rating, feedback });
    res.json({ id: doc.id, ...exchange, rating, feedback });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
