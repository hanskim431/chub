package com.chub.service;

import static java.util.Optional.*;

import com.chub.common.PageInfo;
import com.chub.common.PageResponse;
import com.chub.dto.request.CreateInterviewerProfileRequest;
import com.chub.dto.request.UpdateInterviewerProfileRequest;
import com.chub.dto.response.InterviewerProfileListData;
import com.chub.dto.response.InterviewerProfileListItemResponse;
import com.chub.dto.response.InterviewerProfileResponse;
import com.chub.entity.InterviewerProfile;
import com.chub.entity.User;
import com.chub.exception.interviewer.InterviewerProfileException;
import com.chub.exception.user.UserException;
import com.chub.repository.InterviewerProfileRepository;
import com.chub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewerProfileServiceImpl implements InterviewerProfileService {

    private final UserRepository userRepository;
    private final InterviewerProfileRepository interviewerProfileRepository;

    @Override
    public InterviewerProfileResponse getMyProfile(Long userId) {
        InterviewerProfile profile = interviewerProfileRepository.findByUserId(userId)
                .orElseThrow(InterviewerProfileException::notFound);

        return InterviewerProfileResponse.from(profile.getUser(), profile);
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

    @Override
    @Transactional
    public void updateProfile(Long userId, UpdateInterviewerProfileRequest request) {
        // 프로필 조회
        InterviewerProfile profile = interviewerProfileRepository.findByUserId(userId)
                .orElseThrow(InterviewerProfileException::notFound);

        ofNullable(request.company())
                .ifPresent(profile::updateCompany);

        ofNullable(request.position())
                .ifPresent(profile::updatePosition);

        ofNullable(request.email())
                .ifPresent(profile::updateEmail);

        ofNullable(request.field())
                .ifPresent(profile::updateField);

        ofNullable(request.price())
                .ifPresent(profile::updatePrice);

        ofNullable(request.interviewStyle())
                .ifPresent(profile::updateInterviewStyle);

        ofNullable(request.bio())
                .ifPresent(profile::updateIntroduction);

        ofNullable(request.languages())
                .ifPresent(langs -> profile.updateLanguages(request.toLanguageVos()));

        ofNullable(request.specialties())
                .ifPresent(specs -> profile.updateSpecialties(request.toSpecialtyVos()));

        ofNullable(request.experiences())
                .ifPresent(exp -> profile.updateExperience(null, request.toExperienceVos()));

        ofNullable(request.education())
                .ifPresent(edu -> profile.updateEducations(request.toEducationVos()));

        ofNullable(request.certifications())
                .ifPresent(cert -> profile.updateCertifications(request.toCertificationVos()));

        ofNullable(request.availableTimeSlots())
                .ifPresent(slots -> profile.updateAvailableTimeSlots(request.toAvailableTimeSlotVos()));

        ofNullable(request.isActive())
                .ifPresent(profile::updateActivationStatus);
    }

    @Override
    public PageResponse<InterviewerProfileListData> getInterviewerProfiles(Long userId, String field, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<InterviewerProfile> profilePage;
        if (field != null && !field.isBlank()) {
            // field 필터링 + isActive=true + 자기 자신 제외
            profilePage = interviewerProfileRepository.findByFieldContainingAndIsActiveTrueAndUserIdNot(field, userId, pageable);
        } else {
            // isActive=true + 자기 자신 제외
            profilePage = interviewerProfileRepository.findByIsActiveTrueAndUserIdNot(userId, pageable);
        }

        // Entity -> DTO 변환
        List<InterviewerProfileListItemResponse> profiles = profilePage.getContent().stream()
                .map(InterviewerProfileListItemResponse::from)
                .collect(Collectors.toList());

        // Wrapper로 감싸기
        InterviewerProfileListData data = InterviewerProfileListData.of(profiles);

        // PageInfo 생성
        PageInfo pageInfo = PageInfo.from(profilePage);

        return PageResponse.success("면접관 목록 조회 성공", data, pageInfo);
    }

    @Override
    public InterviewerProfileResponse getInterviewerProfileById(Long id) {
        InterviewerProfile profile = interviewerProfileRepository.findById(id)
                .orElseThrow(InterviewerProfileException::notFound);

        User user = profile.getUser();
        return InterviewerProfileResponse.from(user, profile);
    }
}
