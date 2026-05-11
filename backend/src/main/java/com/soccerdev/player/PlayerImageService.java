package com.soccerdev.player;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlayerImageService {

    private static final long MAX_SIZE = 2L * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    private final PlayerRepository playerRepository;
    private final AuthorizationService authorizationService;
    private final ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    private final Cloudinary cloudinary;

    @Transactional
    public PlayerResponse uploadProfileImage(User user, Long playerId, MultipartFile file) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + playerId));

        if (!canUploadImage(user, playerId)) {
            throw new AccessDeniedException("Access denied");
        }

        validateFile(file);

        player.setProfileImageUrl(uploadToCloudinary(file, playerId));
        return toResponse(playerRepository.save(player));
    }

    private boolean canUploadImage(User user, Long playerId) {
        if (authorizationService.canEditPlayer(user, playerId)) return true;
        return user.getRole() == UserRole.PARENT
                && parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(user.getId(), playerId);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 2MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type must be jpg, jpeg, png, or webp");
        }
    }

    @SuppressWarnings("unchecked")
    private String uploadToCloudinary(MultipartFile file, Long playerId) {
        try {
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", "player-profiles/" + playerId,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IllegalStateException("Failed to upload image to Cloudinary", e);
        }
    }

    private PlayerResponse toResponse(Player player) {
        return PlayerResponse.builder()
                .id(player.getId())
                .teamId(player.getTeam() != null ? player.getTeam().getId() : null)
                .teamName(player.getTeam() != null ? player.getTeam().getName() : null)
                .firstName(player.getFirstName())
                .lastName(player.getLastName())
                .dateOfBirth(player.getDateOfBirth())
                .primaryPosition(player.getPrimaryPosition())
                .secondaryPosition(player.getSecondaryPosition())
                .strongFoot(player.getStrongFoot())
                .jerseyNumber(player.getJerseyNumber())
                .publicProfileEnabled(player.isPublicProfileEnabled())
                .profileImageUrl(player.getProfileImageUrl())
                .active(player.isActive())
                .createdAt(player.getCreatedAt())
                .updatedAt(player.getUpdatedAt())
                .build();
    }
}
