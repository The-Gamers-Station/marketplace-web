package com.thegamersstation.marketplace.user.mapper;

import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.dto.PublicUserProfileDto;
import com.thegamersstation.marketplace.user.dto.UserProfileDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    @Mapping(target = "socialLinks.facebook", source = "facebookLink")
    @Mapping(target = "socialLinks.twitter", source = "twitterLink")
    @Mapping(target = "socialLinks.instagram", source = "instagramLink")
    @Mapping(target = "socialLinks.youtube", source = "youtubeLink")
    @Mapping(target = "socialLinks.linkedin", source = "linkedinLink")
    @Mapping(target = "socialLinks.github", source = "githubLink")
    @Mapping(target = "socialLinks.website", source = "websiteLink")
    UserProfileDto toProfileDto(User user);

    PublicUserProfileDto toPublicProfileDto(User user);
}
