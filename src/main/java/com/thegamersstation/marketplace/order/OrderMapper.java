package com.thegamersstation.marketplace.order;

import com.thegamersstation.marketplace.order.dto.OrderDto;
import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.post.PostImage;
import com.thegamersstation.marketplace.user.repository.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    
    @Mapping(source = "buyer", target = "buyer")
    @Mapping(source = "seller", target = "seller")
    @Mapping(source = "post", target = "post")
    @Mapping(source = "shippingName", target = "recipientName")
    @Mapping(source = "shippingPhone", target = "recipientPhone")
    @Mapping(source = "shippingCity", target = "recipientCity")
    @Mapping(source = "shippingDistrict", target = "recipientDistrict")
    OrderDto toDto(Order order);
    
    // Map User to UserSummary
    @Mapping(source = "id", target = "id")
    @Mapping(source = "username", target = "username")
    OrderDto.UserSummary toUserSummary(User user);
    
    // Map Post to PostSummary
    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "images", target = "images")
    OrderDto.PostSummary toPostSummary(Post post);
    
    // Map PostImage to ImageDto
    @Mapping(source = "url", target = "url")
    OrderDto.ImageDto toImageDto(PostImage postImage);
    
    // Map list of PostImage to list of ImageDto
    default List<OrderDto.ImageDto> mapImages(List<PostImage> images) {
        if (images == null) {
            return List.of();
        }
        return images.stream()
                .map(this::toImageDto)
                .collect(Collectors.toList());
    }
}
