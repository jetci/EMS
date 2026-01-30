import React, { useState, useEffect } from 'react';
import { CommunityView } from '../types';
import LeafletMapEditor from '../components/admin/LeafletMapEditor';
import { formatDateToThai } from '../utils/dateUtils';
import CameraIcon from '../components/icons/CameraIcon';
import UploadIcon from '../components/icons/UploadIcon';
import PaperclipIcon from '../components/icons/PaperclipIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { defaultProfileImage } from '../assets/defaultProfile';
import TagInput from '../components/ui/TagInput';
import MultiSelectAutocomplete from '../components/ui/MultiSelectAutocomplete';
import ModernDatePicker from '../components/ui/ModernDatePicker';
import SuccessModal from '../components/modals/SuccessModal';
import { apiRequest } from '../src/services/api';

// ... (keep all existing code until line 397)

// At line 398, replace with:
<LeafletMapEditor />
