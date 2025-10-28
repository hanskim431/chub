package com.chub.service;

import com.chub.dto.request.CreateInterviewerProfileRequest;
import com.chub.dto.response.InterviewerProfileResponse;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.exception.interviewer.InterviewerProfileException;
import com.chub.exception.user.UserException;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewerProfileServiceImpl implements InterviewerProfileService {

    private final UserRepository userRepository;
    private final InterviewerProfileRepository interviewerProfileRepository;

    @Override
    public InterviewerProfileResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);

        InterviewerProfile profile = interviewerProfileRepository.findByUserId(userId)
                .orElseThrow(InterviewerProfileException::notFound);

        return InterviewerProfileResponse.from(user, profile);
    }

    @Override
    @Transactional
    public void createProfile(Long userId, CreateInterviewerProfileRequest request) {
        // 중복 체크
        if (interviewerProfileRepository.existsByUserId(userId)) {
            throw InterviewerProfileException.alreadyExists();
        }

        // User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(UserException::userNotFound);

        // InterviewerProfile 생성
        InterviewerProfile profile = InterviewerProfile.of(user, request.company(), request.position());

        // 기본 정보 설정
        profile.updateEmail(request.email());
        profile.updateField(request.field());
        profile.updatePrice(request.price());
        profile.updateInterviewStyle(request.interviewStyle());
        profile.updateIntroduction(request.bio());

        // 스킬 및 경력 정보 설정
        profile.updateSkills(request.toLanguageVos(), request.toSpecialtyVos());
        profile.updateExperience(null, request.toExperienceVos());
        profile.updateEducations(request.toEducationVos());
        profile.updateCertifications(request.toCertificationVos());
        profile.updateAvailableTimeSlots(request.toAvailableTimeSlotVos());

        // 저장
        interviewerProfileRepository.save(profile);
    }
}
