
import { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { API_URL } from '@/lib/api'

type Room = {
  id: string
  roomNumber: number
  name: string
  description: string
  capacity: number
  basePrice: number
  amenities: string[]
  category: string
  imageUrl: string | null
  status: string
}

const COLORS = {
  forest: '#103713',
  olive: '#628B35',
  cream: '#FFFDF5',
  bone: '#E2DBD0',
  white: '#FFFFFF',
  muted: '#82917C',
  softGreen: '#EDF2E7',
  softBeige: '#F5F0E2',
}

export default function CatalogScreen() {
  const router = useRouter()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  async function fetchRooms() {
    try {
      const res = await fetch(`${API_URL}/rooms`)
      const data = await res.json()

      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchRooms()
    }, [])
  )

  function onRefresh() {
    setRefreshing(true)
    fetchRooms()
  }

  const categories = [
    'All',
    ...Array.from(new Set(rooms.map(room => room.category).filter(Boolean))),
  ]

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.category.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' || room.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  function renderRoom({ item }: { item: Room }) {
    const imageUrl = item.imageUrl
      ? `http://192.168.100.118:3000${item.imageUrl}`
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'

    const isBooked = item.status === 'BOOKED'

    return (
      <TouchableOpacity
        style={styles.roomCard}
        activeOpacity={0.92}
        onPress={() => router.push(`/room/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.roomImage}
            resizeMode="cover"
          />

          <View style={[styles.statusBadge, isBooked ? styles.bookedBadge : styles.availableBadge]}>
            <Ionicons
              name={isBooked ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={12}
              color={COLORS.white}
            />
            <Text style={styles.statusText}>
              {isBooked ? 'BOOKED' : 'AVAILABLE'}
            </Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.roomContent}>
          <View style={styles.roomTopRow}>
            <View style={styles.roomTitleContainer}>
              <Text style={styles.roomName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.roomPrice}>
                ₱{item.basePrice.toLocaleString()}
              </Text>
              <Text style={styles.priceUnit}>per night</Text>
            </View>
          </View>

          <View style={styles.roomInfoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={15} color={COLORS.olive} />
              <Text style={styles.infoText}>
                Up to {item.capacity} guests
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsText}>View room details</Text>
            <View style={styles.viewDetailsIcon}>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.olive} />
        <Text style={styles.loadingText}>Finding your perfect stay...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.olive}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.brandLabel}>MI CASA DE CAGSAWA</Text>
                <Text style={styles.headerTitle}>Find your stay.</Text>
                <Text style={styles.headerSubtitle}>
                  A comfortable place to unwind.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={COLORS.forest}
                />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.olive} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search rooms..."
                placeholderTextColor={COLORS.muted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Room categories */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore our rooms</Text>
              <Text style={styles.roomCount}>
                {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'}
              </Text>
            </View>

            <FlatList
              horizontal
              data={categories}
              keyExtractor={item => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item

                return (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(item)}
                    style={[styles.filterChip, isSelected && styles.activeFilterChip]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isSelected && styles.activeFilterText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              }}
            />

            <View style={styles.listIntro}>
              <Text style={styles.listIntroText}>
                Choose a room that feels right for you.
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bed-outline" size={32} color={COLORS.olive} />
            </View>
            <Text style={styles.emptyTitle}>No rooms found</Text>
            <Text style={styles.emptySubtitle}>
              Try another search or category.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearch('')
                setSelectedCategory('All')
              }}
            >
              <Text style={styles.resetButtonText}>Show all rooms</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.muted,
  },

  listContent: {
    paddingBottom: 28,
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 58 : 48,
    paddingHorizontal: 22,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  brandLabel: {
    color: COLORS.olive,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.forest,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.olive,
    marginTop: 5,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.bone,
    marginLeft: 12,
  },

  searchContainer: {
    height: 50,
    marginHorizontal: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.bone,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.forest,
    paddingVertical: 0,
  },

  sectionHeader: {
    marginTop: 28,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.forest,
  },
  roomCount: {
    fontSize: 12,
    color: COLORS.muted,
  },

  filterList: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.softBeige,
    borderWidth: 1,
    borderColor: COLORS.bone,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
  },
  activeFilterChip: {
    backgroundColor: COLORS.olive,
    borderColor: COLORS.olive,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.forest,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  listIntro: {
    paddingHorizontal: 22,
    marginTop: 18,
    marginBottom: 14,
  },
  listIntroText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  roomCard: {
    marginHorizontal: 22,
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.bone,
    overflow: 'hidden',
  },

  imageContainer: {
    height: 220,
    position: 'relative',
    backgroundColor: COLORS.bone,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },

  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
  },
  availableBadge: {
    backgroundColor: COLORS.olive,
  },
  bookedBadge: {
    backgroundColor: COLORS.forest,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: COLORS.forest,
    fontSize: 11,
    fontWeight: '600',
  },

  roomContent: {
    padding: 16,
  },
  roomTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  roomTitleContainer: {
    flex: 1,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.forest,
  },
  roomNumber: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  priceContainer: {
    alignItems: 'flex-end',
  },
  roomPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.olive,
  },
  priceUnit: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  roomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.olive,
  },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.bone,
    marginTop: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.forest,
  },
  viewDetailsIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 45,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.forest,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: COLORS.olive,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
})
